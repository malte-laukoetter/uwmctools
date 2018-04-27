import {BotFramework} from 'lergins-bot-framework';
import * as path from "path";
import { MainMapPlotStatsUpdater } from './updater/MainMapPlotStatsUpdater';
import { RulesUpdater } from './updater/RulesUpdater';
import { Push } from './notifications/Push';
import { WorldStatsUpdater } from './updater/WorldStatsUpdater';
import { FreeZonesUpdater } from './updater/FreeZonesUpdater';

export const bot = new BotFramework.Builder()
  .configFolderPath(path.join(__dirname, '..'))
  .observer('push', Push)
  .forceFirebaseInit()
  .build();

bot.addUpdater(new MainMapPlotStatsUpdater());
bot.addUpdater(new RulesUpdater());
bot.addUpdater(new WorldStatsUpdater());
bot.addUpdater(new FreeZonesUpdater());

bot.start();