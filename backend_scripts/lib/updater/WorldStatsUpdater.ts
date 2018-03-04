import { BasicUpdater } from "lergins-bot-framework";
import { database } from "firebase-admin";
import * as UwmcTools from 'uwmctools';
import { MainMapPlotStatsUpdater } from "./MainMapPlotStatsUpdater";

export class WorldStatsUpdater extends BasicUpdater {
  readonly ref;
  readonly timelineRef;
  readonly currentRef;
  readonly uwmcTools;

  get id() {
    return 'world-stats'
  }

  constructor() {
    super();

    const db = database();

    this.ref = db.ref('uwmctools/stats/world');
    this.timelineRef = this.ref.child('timeline');
    this.currentRef = this.ref.child('current');

    this.uwmcTools = new (UwmcTools as any)('');
  }
  
  async updateInfo() {
    this.ref.child('updated').set(new Date().toISOString());
    const worldStats = await this.uwmcTools.getZoneMapStatData();

    for (let area in worldStats) {
      if ({}.hasOwnProperty.call(worldStats, area)) {
        const timelineAreaRef = this.timelineRef.child(area);
        const currentAreaRef = this.currentRef.child(area);

        timelineAreaRef.child('playerzoneAmount').child(MainMapPlotStatsUpdater.getDateString(new Date()))
          .set(worldStats[area].playerzones.amount);
        timelineAreaRef.child('playerzoneArea').child(MainMapPlotStatsUpdater.getDateString(new Date()))
          .set(worldStats[area].playerzones.area);
        timelineAreaRef.child('serverzoneArea').child(MainMapPlotStatsUpdater.getDateString(new Date()))
          .set(worldStats[area].serverzones);
        timelineAreaRef.child('area').child(MainMapPlotStatsUpdater.getDateString(new Date())).set(worldStats[area].size);

        currentAreaRef.child('playerzoneAmount').set(worldStats[area].playerzones.amount);
        currentAreaRef.child('playerzoneArea').set(worldStats[area].playerzones.area);
        currentAreaRef.child('serverzoneArea').set(worldStats[area].serverzones);
        currentAreaRef.child('area').set(worldStats[area].size);
      }
    }
  }
}