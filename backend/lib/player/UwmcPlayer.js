const EventEmitter = require('events');

const config = require('../config.json');

const Player = require('./Player');
const Plot = require('../zones/Plot');
const PlayerZone = require('../zones/PlayerZone');
const MainMapPlot = require('../zones/MainMapPlot');

/**
 * the {@link EventEmitter} for the {@link UwmcPlayer}
 * @private
 */
class UwmcPlayerEmitter extends EventEmitter {}
const emitter = new UwmcPlayerEmitter();

/**
 * A Player of Unlimitedworld.de
 */
class UwmcPlayer extends Player {
    /**
     * creates a new Player
     * @param {string} uuid the uuid of the player
     */
    constructor(uuid) {
        super(uuid);
    }

    /**
     * the current rank of the player
     * @type {int}
     */
    get rank() {
        return this._rank;
    }
    set rank(rank) {
        this._rank = rank;
    }

    /**
     * the rankname of the player
     * @type {string}
     * @readonly
     */
    get rankName() {
        UwmcPlayer.rankToRankName(this.rank);
    }

    /*
     * the id of the forum account
     * @type {int}
     */
    get boardId() {
        return this._boardId;
    }
    set boardId(boardId) {
        this._boardId = boardId;
    }

    /*
     * the date the player was last online on the server
     * @type {Date}
     */
    get lastPlayed() {
        return this._lastPlayed || new Date(0);
    }
    set lastPlayed(date) {
        this._lastPlayed = date;
    }

    /**
     * adds a rank change to the rank history
     * @param {int} rank the rank changed to
     * @param {Date} date the {@link Date} of the rankchange
     */
    addRankChange(rank, date) {
        if (!this._rankHistory) this._rankHistory = [];

        this._rankHistory.push({
            rank: rank,
            date: date
        });

        UwmcPlayer.eventEmitter.emit('rankchange', {
            player: this,
            rank: rank
        });
    }

    /**
     * the rank history
     * @type {Array.<Object>}
     * @property {int} obj.rank
     * @property {Date} obj.date
     * @readonly
     */
    get rankHistory() {
        return this._rankHistory || [];
    }

    /**
     * overwrites the rank history to the value without checking the format (use {@link addRankChange} instead)
     * @param {Array.<Object>} rankHistory the rankhistory
     * @private
     */
    _setRankHistory(rankHistory) {
        this._rankHistory = rankHistory;
    }

    /**
     * sets the votes for a specific month and votesite
     * @param {int} year the year of the votes
     * @param {int} month the month of the votes
     * @param {string} site the vote site of the votes
     * @param {int} votes the amount of votes
     */
    setVotes(year, month, site, votes) {
        if (!this._votes) this._votes = {};

        if (!this._votes[year]) this._votes[year] = {};

        if (!this._votes[year][month]) this._votes[year][month] = {};

        this._votes[year][month][site] = votes;
    }

    /**
     * overwrites the vote history to the value without checking the format (use setVotes instead)
     * @param {Array.<Object>} votes the votedata to overwrite by
     */
    _setVotes(votes) {
        this._votes = votes;
    }

    /**
     * the vote history
     * @type {Array.<Object>}
     * @readonly
     */
    get votes() {
        return this._votes || {};
    }

    /**
     * adds a Plot to the plotlist
     * @param {Plot} plot the plot to add
     */
    addPlot(plot) {
        if (!Plot.isPlot(plot)) throw new Error('no Plot');

        if (!this._plots) this._plots = [];

        this._plots.push(plot);

        UwmcPlayer.eventEmitter.emit('newplot', {
            player: this,
            plot: plot
        });
    }

    /**
     * overwrites the plotlist to the value without checking the format (use {@link addPlot} instead)
     * @param {Array.<Plot>} plots the data to overwrite by
     * @private
     */
    _setPlots(plots) {
        this._plots = plots;
    }

    /**
     * all plots the player is associated with
     * @type {Array.<Plot>}
     * @readonly
     */
    get plots() {
        return this._plots || [];
    }

    /**
     * adds a zone to the zonelist of the player
     * @param {PlayerZone} zone the zone to add
     */
    addZone(zone) {
        if (!PlayerZone.isPlayerZone(zone)) throw new Error('no PlayerZone');

        if (!this._zones) this._zones = [];

        this._zones.push(zone);

        UwmcPlayer.eventEmitter.emit('newzone', {
            player: this,
            zone: zone
        });
    }

    /**
     * overwrites the zonelist to the value without checking the format (use {@link addZone} instead)
     * @param {Array.<PlayerZone>} zones the data to overwrite by
     * @private
     */
    _setZones(zones) {
        this._zones = zones;
    }

    /**
     * all the zones the player owns
     * @type {Array.<PlayerZone>}
     * @readonly
     */
    get zones() {
        return this._zones || [];
    }

    /**
     * adds a main map plot to the mainmapplotlist of the player
     * @param {MainMapPlot} plot the {@link MainMapPlot} to add
     */
    addMainMapPlot(plot) {
        if (!MainMapPlot.isMainMapPlot(plot)) throw new Error('no MainMapPlot');

        if (!this._mainMapPlots) this._mainMapPlots = [];

        this._mainMapPlots.push(plot);

        UwmcPlayer.eventEmitter.emit('newmainmapplot', {
            player: this,
            plot: plot
        });
    }

    /**
     * overwrites the mainmapplotlist to the value without checking the format (use {@link addMainMapPlot} instead)
     * @param {Array.<MainMapPlot>} plots the data to overwrite by
     * @private
     */
    _setMainMapPlots(plots) {
        this._mainMapPlots = plots;
    }

    /**
     * all the mainMapPlots the player owns
     * @type {Array.<MainMapPlot>}
     * @readonly
     */
    get mainMapPlots() {
        return this._mainMapPlots || [];
    }

    /**
     * the days since the players lastPlayed date
     * @type {int}
     * @readonly
     */
    get daysSinceLastPlayed() {
        return Math.floor(Math.abs(this.lastPlayed().getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    }

    /**
     * is the player is active (eg. was online within the last 62 Days)
     * @type {boolean}
     * @readonly
     */
    get active() {
        return this.daysSinceLastPlayed() < 62;
    }

    /**
     * converts the UwmcPlayer to JSON
     * @return {Object} the converted data
     */
    toJson() {
        return {
            'uuid': this.uuid,
            'name': this.name,
            'rank': this.rank,
            'ranks': this.rankHistory,
            'boardId': this.boardId,
            'votes': this.votes,
            'zones': this.zones,
            'plots': this.plots,
            'mainMapPlots': this.mainMapPlots
        };
    }

    /**
     * converts the rank if  to the human readable version (name of the rank)
     * @param {int} rank
     * @return {string} the name of the rank
     */
    static rankToRankName(rank) {
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

    /**
     * the event emitter for the UwmcPlayer class (not the emitter for an instance of the UwmcPlayer)
     * @type {UwmcPlayerEmitter}
     * @readonly
     */
    static get eventEmitter() {
        return emitter;
    }
}

module.exports = UwmcPlayer;