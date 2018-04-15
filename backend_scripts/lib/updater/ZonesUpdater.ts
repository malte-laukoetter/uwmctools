import { BasicUpdater } from "lergins-bot-framework";
import { database } from "firebase-admin";
import * as UwmcTools from 'uwmctools';


export class ZonesUpdater extends BasicUpdater {
  readonly dataRef;
  readonly listRef;
  readonly playerRef;
  readonly uwmcTool;

  get id() {
    return 'zones'
  }

  constructor() {
    super();

    const db = database();

    this.dataRef = db.ref('uwmctools/zones/data');
    this.listRef = db.ref('uwmctools/zones/list');
    this.playerRef = db.ref('uwmctools/zones/data');
    this.uwmcTool = new (UwmcTools as any)('');
  }

  async updateInfo() {
    const zoneListData = await this.uwmcTool.getZoneListData();
    this.listRef.once('value', (arr) => {
      let oldZoneSet = arr.val() ? new Set(Object.keys(arr.val())) : new Set();

      zoneListData.forEach((zone) => {
        let zoneDataRef = this.dataRef.child(zone.id);
        if (!oldZoneSet.has(zone.id)) {
          zoneDataRef.child('pos').set(zone.pos);
          zoneDataRef.child('number').set(zone.number);
          zoneDataRef.child('created').set(new Date().getTime());
          zoneDataRef.child('owner').set(zone.player.uuid);
          this.playerRef.child(zone.player.uuid).child('zones').child(zone.id).set(true);
        } else {
          oldZoneSet.delete(zone.id);
        }
      });

      oldZoneSet.forEach((zoneId) => {
        let zoneDataRef = this.dataRef.child(zoneId);

        zoneDataRef.child('deleted').set(new Date().getTime());
      });

      this.listRef.set(zoneListData.map((zone) => zone.id));
    });
  }
}
