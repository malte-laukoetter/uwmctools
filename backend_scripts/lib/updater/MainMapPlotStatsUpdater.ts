import { BasicUpdater } from "lergins-bot-framework";
import { database } from "firebase-admin";
import * as UwmcTools from 'uwmctools';


export class MainMapPlotStatsUpdater extends BasicUpdater {
  readonly timelineRef;
  readonly currentRef;
  readonly uwmcTool;

  get id() {
    return 'mainmap-plot-stats'
  }

  constructor(){
    super();
    
    const db = database();
    const ref = db.ref('uwmctools/stats/mainmapplots');

    this.timelineRef = ref.child('timeline');
    this.currentRef = ref.child('current');
    this.uwmcTool = new (UwmcTools as any)('');
  }

  async updateInfo() {
    const data = await this.uwmcTool.getMainMapPlotStatData();

    for (const item in data) {
      if ({}.hasOwnProperty.call(data, item)) {
        this.timelineRef.child(item).child('free').child(MainMapPlotStatsUpdater.getDateString(new Date())).set(data[item].free);
        this.timelineRef.child(item).child('full').child(MainMapPlotStatsUpdater.getDateString(new Date())).set(data[item].full);
        this.currentRef.child(item).child('free').set(data[item].free);
        this.currentRef.child(item).child('full').set(data[item].full);
        this.currentRef.child(item).child('all').set(data[item].full + data[item].free);
      }
    }
  }

  /**
   * generates a string of the date
   * @param {Date} date
   * @return {string}
   */
  static getDateString(date) {
    return date.toISOString().substring(0, 10);
  }
}
