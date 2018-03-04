import { BasicUpdater } from "lergins-bot-framework";
import { database } from "firebase-admin";
import * as UwmcTools from 'uwmctools';


export class PlotsUpdater extends BasicUpdater {
  readonly dataRef;
  readonly listRef;
  readonly playerRef;
  readonly uwmcTool;

  get id() {
    return 'plots'
  }

  constructor() {
    super();

    const db = database();

    this.dataRef = db.ref('uwmctools/plots/data');
    this.listRef = db.ref('uwmctools/plots/list');
    this.playerRef = db.ref('uwmctools/players/data');
    this.uwmcTool = new (UwmcTools as any)('');
  }

  async updateInfo() {
    const plotListData = await this.uwmcTool.getPlotListData();

    this.listRef.once('value', function (arr) {
      let oldPlotSet = arr ? new Set(arr.val()) : new Set();

      plotListData.forEach((plot) => {
        let plotDataRef = this.dataRef.child(plot.id);

        if (oldPlotSet.has(plot.id)) {
          plotDataRef.once('value', function (data) {
            if (!plot.owner || (data.val().owner && data.val().owner !== plot.owner.uuid)) {
              if (data.val().owner) {
                this.playerRef.child(data.val().owner).child('plots').child('owned').child(plot.id).remove();
              }

              if (data.val().trusted) {
                data.val().trusted.forEach((uuid) => {
                  this.playerRef.child(uuid).child('plots').child('trusted').child(plot.id).remove();
                });
              }
            }

            if (plot.owner && data.val().owner !== plot.owner.uuid) {
              createNewFirebasePlot(plotDataRef, this.playerRef, plot);
            }
          });

          oldPlotSet.delete(plot.id);
        } else {
          createNewFirebasePlot(plotDataRef, this.playerRef, plot);
        }
      });

      oldPlotSet.forEach((plotId) => {
        let plotDataRef = this.dataRef.child(plotId);

        plotDataRef.once('value', function (data) {
          this.playerRef.child(data.val().owner).child('plots').child('owned').child(plotId).remove();
          if (data.val().trusted) {
            data.val().trusted.forEach((uuid) => {
              this.playerRef.child(uuid).child('plots').child('trusted').child(plotId).remove();
            });
          }
          plotDataRef.remove();
        });
      });

      this.listRef.set(plotListData.map((plot) => plot.id));
    });
  }

  /**
   * generates a string of the date
   * @param {Date} date
   * @return {string}
   */
  private static getDateString(date) {
    return date.toISOString().substring(0, 10);
  }
}

function createNewFirebasePlot(dataRef, playerRef, plot) {
  dataRef.child('pos').set(plot.pos);
  dataRef.child('posX').set(plot.posX);
  dataRef.child('posZ').set(plot.posZ);
  dataRef.child('created').set(new Date().getTime());
  dataRef.child('trusted').set(plot.trusted.map((player) => player.uuid));
  if (plot.owner && plot.owner.uuid) {
    dataRef.child('owner').set(plot.owner.uuid);
    playerRef.child(plot.owner.uuid).child('plots').child('owned').child(plot.id).set(true);
  }
  plot.trusted.forEach((player) => {
    if (player.uuid) {
      playerRef.child(player.uuid).child('plots').child('trusted').child(plot.id).set(true);
    }
  });
}