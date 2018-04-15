import { BasicUpdater } from "lergins-bot-framework";
import { database } from "firebase-admin";
import * as UwmcTools from 'uwmctools';


export class FreeZonesUpdater extends BasicUpdater {
  readonly dataRef;
  readonly uwmcTool;

  get id() {
    return 'free-zones'
  }

  constructor() {
    super();

    const db = database();

    this.dataRef = db.ref('uwmctools/freeareas');
    this.uwmcTool = new (UwmcTools as any)('');
  }

  async updateInfo() {
    console.log(await this.uwmcTool.getFreeZones(100, 100))
  }
}
