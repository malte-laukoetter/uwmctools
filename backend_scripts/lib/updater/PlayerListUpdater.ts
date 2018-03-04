import { BasicUpdater } from "lergins-bot-framework";
import { database } from "firebase-admin";
import * as UwmcTools from 'uwmctools';
import { bot } from '../main';

export class PlayerListUpdater extends BasicUpdater {
  readonly searchRef;
  readonly dataRef;
  readonly onlineRef;
  readonly uwmcTool;

  get id() {
    return 'player-list'
  }

  constructor() {
    super();

    const db = database();
    const ref = db.ref('uwmctools/players');

    this.searchRef = ref.child('search');
    this.dataRef = ref.child('data');
    this.onlineRef = ref.child('online');
    this.uwmcTool = new (UwmcTools as any)('');
 }

  async updateInfo() {
    const playerListData = await this.uwmcTool.getPlayerListData();

    const prevOnlinePlayers = await this.onlineRef.once('value').then((onlineplayers) => {
      if (!onlineplayers.val()) return new Set();

      onlineplayers = onlineplayers.val();

      const names = new Set(Object.keys(onlineplayers));
      const online = new Set(names);

      playerListData.forEach((player) => {
        names.delete(player.name);
      });

      names.forEach((name) => {
        bot.send('push', {to: `/topics/UWMCTOOLS_PLAYER_OFFLINE_${onlineplayers[name]}`, data: {
          'title': `${name} ist Offline`,
          'click_action': `https://uwmc.lergin.de/player/${name}/overview`,
          'icon': `https://crafatar.com/avatars/${onlineplayers[name]}?overlay`,
        }});
        this.onlineRef.child(name).remove();
      });

      return online;
    });


    playerListData.forEach((player) => {
      if (!prevOnlinePlayers.has(player.name)) {
        bot.send('push', {
          to: `/topics/UWMCTOOLS_PLAYER_ONLINE_${player.uuid}`, data: {
            'title': `${player.name} ist Online`,
            'click_action': `https://uwmc.lergin.de/player/${player.name}/overview`,
            'icon': `https://crafatar.com/avatars/${player.uuid}?overlay`,
          }
        });
      }

      this.searchRef.child(player.name).set(player.uuid);
      this.onlineRef.child(player.name).set(player.uuid);
      let playerDataRef = this.dataRef.child(player.uuid);
      playerDataRef.child('name').set(player.name);

      playerDataRef.child('rank').once('value', function (data) {
        if (data.val() !== player.rank) {
          playerDataRef.child('rank').set(player.rank);
          playerDataRef.child('rankchanges').child(new Date().getTime()).set(player.rank);
          bot.send('push', {
            to: `/topics/UWMCTOOLS_PLAYER_RANKCHANGE_${player.uuid}`, data: {
              'title': `Rangänderung von ${player.name}`,
              'body': `${player.name} ist jetzt ${rankToName(player.rank)}!`,
              'click_action': `https://uwmc.lergin.de/player/${player.name}/overview`,
              'icon': `https://crafatar.com/avatars/${player.uuid}?overlay`,
            }
          });
        }
      });
      if (player.boardId) {
        playerDataRef.child('boardId').set(player.boardId);
      }
    })
  }
}

function rankToName(rank) {
  switch (rank) {
    case 10:
      return 'Owner';
    case 20:
      return 'Dev';
    case 30:
      return 'Admin';
    case 40:
      return 'Mod';
    case 45:
      return 'Builder';
    case 50:
      return 'Buddy';
    case 60:
      return 'Guard';
    case 70:
      return 'Trusty';
    case 80:
      return 'Spieler';
    case 90:
      return 'Gast';
    default:
      return 'unknown';
  }
}