const MongoClient = require('mongodb').MongoClient;

const PlayerListRequest = require('./requests/PlayerListRequest');
const ZoneListRequest = require('./requests/ZoneListRequest');
const PlotListRequest = require('./requests/PlotListRequest');
const VoteListRequest = require('./requests/VoteListRequest');
const FreeZonesCalcRequest = require('./requests/FreeZonesCalcRequest');
const MainMapPlotRequest = require('./requests/MainMapPlotRequest');
const ZoneMapStatRequest = require('./requests/ZoneMapStatRequest');
const MainMapPlotStatRequest = require('./requests/MainMapPlotStatRequest');
const UwmcPlayer = require('./player/UwmcPlayer');
const Player = require('./player/Player');
const MainMapZone = require('./zones/MainMapZone');
const PlayerZone = require('./zones/PlayerZone');
const Plot = require('./zones/Plot');
const ServerZone = require('./zones/ServerZone');
const Zone = require('./zones/Zone');

/**
 * Main Class of the uwmc tools
 */
class UwmcTool {
    /**
     * creates a new UwmcTool
     * @param {string} mongoDbUrl the connection url of the MongoDb database that should be used by the Requests
     */
    constructor(mongoDbUrl) {
        this._mongoDbUrl = mongoDbUrl;

        this._playerListRequest = new PlayerListRequest();
        this._zoneListRequest = new ZoneListRequest();
        this._plotListRequest = new PlotListRequest();
        this._voteListRequest = new VoteListRequest();
        this._freeZonesCalcRequest = new FreeZonesCalcRequest();
        this._mainMapPlotRequest = new MainMapPlotRequest();
        this._zoneMapStatRequest = new ZoneMapStatRequest();
        this._mainMapPlotStatRequest = new MainMapPlotStatRequest();
    }

    /**
     * the url of the mongodb database
     * @type {string}
     * @readonly
     */
    get mongoDbUrl() {
        return this._mongoDbUrl;
    }

    /**
     * connect to the database
     * @return {Promise} the result of the MongoDb connection function
     */
    connect() {
        let main = this;
        return new Promise(function (resolve, reject) {
            MongoClient.connect(main.mongoDbUrl, function (err, db) {
                if (err) reject(err);

                resolve(db);
            });
        });
    }

    /**
     * gets the data from the playerlist
     * @return {Promise.<*>} the response of {@see PlayerListRequest#execute}
     */
    getPlayerListData() {
        return this._playerListRequest.execute();
    }

    /**
     * gets the data about the zones
     * @return {Promise.<*>} the response of {@see ZoneListRequest#execute}
     */
    getZoneListData() {
        return this._zoneListRequest.execute();
    }

    /**
     * gets the data about the plots
     * @return {Promise.<*>} the response of {@see PlotListRequest#execute}
     */
    getPlotListData() {
        return this._plotListRequest.execute();
    }

    /**
     * save the data from the votelist
     * @return {Promise.<*>} the response of {@see VoteListRequest#execute}
     */
    getVoteListData() {
        return this._voteListRequest.execute();
    }

    /**
     * save the data about the main map plots
     * @return {Promise.<*>} the response of {@see MainMapPlotRequest#execute}
     */
    getMainMapPlotData() {
        return this._mainMapPlotRequest.execute();
    }

    /**
     * save the statistic data about the zones of the main map
     * @return {Promise.<*>} the response of {@see ZoneMapStatRequest#execute}
     */
    getZoneMapStatData() {
        return this._zoneMapStatRequest.execute();
    }

    /**
     * save the statistic data about the plots of the main map
     * @return {Promise.<*>} the response of {@see MainMapPlotStatRequest#execute}
     */
    getMainMapPlotStatData() {
        return this._mainMapPlotStatRequest.execute();
    }

    /**
     * gets all free Zones of the given length and width
     * @param {int} length the length of the free areas to find
     * @param {int} width the width of the free areas to find
     * @return {Promise.<Array.<Zone>>} the free areas
     */
    getFreeZones(length, width) {
        return this._freeZonesCalcRequest.execute(length, width);
    }

    /*
     * get the information about the player with the given uuid
     */
    getPlayer(uuid) {
        return this.connect().then(function (db) {
            return UwmcPlayer.createFromDb(db, uuid);
        });
    }

    /*
     * converts the rank id of an rank to the coresponding name
     */
    static rankToRankName(rank) {
        return UwmcPlayer.rankToRankName(rank);
    }

    /**
     * save the data of the request
     * @param {Request} request the request whose data should be saved
     * @return {Promise.<*>} the result of the request
     * @private
     */
    _saveData(request) {
        return this.connect().then(function (db) {
            return request.execute(db).then(function (res) {
                db.close();
                return res;
            });
        });
    }

    /**
     * the UwmcPlayer class
     * @Type {Class}
     * @readonly
     */
    static get UwmcPlayer() {
        return UwmcPlayer;
    }

    /**
     * the Player class
     * @Type {Class}
     * @readonly
     */
    static get Player() {
        return Player;
    }

    /**
     * the MainMapZone class
     * @Type {Class}
     * @readonly
     */
    static get MainMapZone() {
        return MainMapZone;
    }

    /**
     * the PlayerZone class
     * @Type {Class}
     * @readonly
     */
    static get PlayerZone() {
        return PlayerZone;
    }

    /**
     * the Plot class
     * @Type {Class}
     * @readonly
     */
    static get Plot() {
        return Plot;
    }

    /**
     * the ServerZone class
     * @Type {Class}
     * @readonly
     */
    static get ServerZone() {
        return ServerZone;
    }

    /**
     * the Zone class
     * @Type {Class}
     * @readonly
     */
    static get Zone() {
        return Zone;
    }
}

/**
 * main module of the uwmctools
 * @type {UwmcTool}
 */
module.exports = UwmcTool;