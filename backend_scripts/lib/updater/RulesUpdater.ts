import { BasicUpdater } from "lergins-bot-framework";
import { database } from "firebase-admin";
import { createHash } from "crypto";
import * as UwmcTools from 'uwmctools';
import { bot } from '../main';

export class RulesUpdater extends BasicUpdater {
  readonly ref;
  readonly uwmcTools;

  get id(){
    return 'rules'
  }

  constructor() {
    super();

    const db = database();

    this.ref = db.ref('uwmctools/rules');
    this.uwmcTools = new (UwmcTools as any)('');
  }

  async updateInfo() {
    const data = createHash('sha1').update(await this.uwmcTools.getRuleData()).digest('hex');
    
    const oldRules = await this.ref.once('value');

    if (oldRules.val() !== data) {
      this.ref.set(data);
      bot.send('push', {to: '/topics/UWMCTOOLS_RULES_CHANGE_0', data: {
        'title': 'Regeländerung UWMC',
        'body': 'Es gab eine Änderung der Regeln von UnlimitedWorld.de',
        'click_action': 'https://uwmc.de/rules',
      }});
    }
  }
}