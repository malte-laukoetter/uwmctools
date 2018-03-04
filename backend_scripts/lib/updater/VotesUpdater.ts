import { BasicUpdater } from "lergins-bot-framework";
import { database } from "firebase-admin";
import * as UwmcTools from 'uwmctools';

export class VotesUpdater extends BasicUpdater {
  readonly ref;
  readonly uwmcTools;

  get id() {
    return 'votes'
  }

  constructor() {
    super();

    const db = database();

    this.ref = db.ref('uwmctools/players/data');
    this.uwmcTools = new (UwmcTools as any)('');
  }

  async updateInfo() {
    const playerListData = await this.uwmcTools.getVoteListData();

    playerListData.forEach((player) => {
      let playerVoteDataRef = this.ref.child(player.uuid).child('votes');

      for (let year in player.votes) {
        for (let month in player.votes[year]) {
          let n = parseInt(month) + 1;
          playerVoteDataRef.child(`${year}-${(n < 10) ? ('0' + n) : n}`).set([
            player.votes[year][month].v1,
            player.votes[year][month].v2,
          ]);
        }
      }
    });
  }
}