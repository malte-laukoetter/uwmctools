import { BasicUpdater } from "lergins-bot-framework";
import { database } from "firebase-admin";
import * as UwmcTools from 'uwmctools';


export class MainMapPlotsUpdater extends BasicUpdater {
  get id() {
    return 'mainmap-plots'
  }

  async updateInfo() {
    const db = database();
    const dataRef = db.ref('uwmctools/mapplots/data');
    const playerRef = db.ref('uwmctools/players/data');

    const uwmcTool = new (UwmcTools as any)('');
    const plotListData = await uwmcTool.getMainMapPlotData();

    plotListData.forEach((plot) => {
      let plotDataRef = dataRef.child(plot.id);

      plotDataRef.child('owners').once('value', function (data) {
        let val = data.val();

        if (!val) {
          plotDataRef.child('pos').set(plot.pos);
          plotDataRef.child('number').set(plot.number);
          plotDataRef.child('area').set(plot.area);
          if (plot.owner && plot.owner.uuid) {
            plotDataRef.child('owners').push({
              uuid: plot.owner.uuid,
              from: new Date().getTime(),
            });
            playerRef.child(plot.owner.uuid).child('mapplots').child(plot.id).set(true);
          }
        }
      });

      plotDataRef.child('owners').orderByKey().limitToLast(1).once('child_added', function (data) {
        if (!plot.owner || data.val().uuid !== plot.owner.uuid) {
          if (!data.val().till) {
            data.ref.child('till').set(new Date().getTime());
          }

          if (plot.owner && plot.owner.uuid) {
            plotDataRef.child('owners').push({
              uuid: plot.owner.uuid,
              from: new Date().getTime(),
            });

            playerRef.child(plot.owner.uuid).child('mapplots').child(plot.id).set(true);
          }
        }
      });
    });
  }
}