import {BotFramework} from 'lergins-bot-framework';
import * as path from "path";
import { MainMapPlotsUpdater } from './updater/MainMapPlotsUpdater';
import { MainMapPlotStatsUpdater } from './updater/MainMapPlotStatsUpdater';
import { RulesUpdater } from './updater/RulesUpdater';
import { PlayerListUpdater } from './updater/PlayerListUpdater';
import { Push } from './notifications/Push';
import { PlotsUpdater } from './updater/PlotsUpdater';
import { VotesUpdater } from './updater/VotesUpdater';
import { WorldStatsUpdater } from './updater/WorldStatsUpdater';
import { ZonesUpdater } from './updater/ZonesUpdater';

export const bot = new BotFramework.Builder()
  .configFolderPath(path.join(__dirname, '..'))
  .observer('push', Push)
  .forceFirebaseInit()
  .build();

bot.addUpdater(new MainMapPlotsUpdater());
bot.addUpdater(new MainMapPlotStatsUpdater());
bot.addUpdater(new PlayerListUpdater());
bot.addUpdater(new PlotsUpdater());
bot.addUpdater(new RulesUpdater());
bot.addUpdater(new VotesUpdater());
bot.addUpdater(new WorldStatsUpdater());
bot.addUpdater(new ZonesUpdater());

bot.start();