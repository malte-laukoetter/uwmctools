const config = require('../config.json');

const MainMapZone = require('./MainMapZone');
const Player = require('../player/Player');

/**
 * a plot in one of the plot areas of the mainmap of unlimitedworld
 */
class MainMapPlot extends MainMapZone {
    /**
     * constructor for a MainMapPlot
     * @param {string} id the id of the plot (eg. uwzone_23131)
     * @param {string} area the area where the plot is located (eg. Neustadt)
     * @param {int} number the plot number in the area
     * @param {int} x1 the x1 coordinate of the area
     * @param {int} x2 the x2 coordinate of the area
     * @param {int} z1 the z1 coordinate of the area
     * @param {int} z2 the z2 coordinate of the area
     */
    constructor(id = '', area = '', number = 0, x1 = 0, x2 = 0, z1 = 0, z2 = 0) {
        super(id, x1, x2, z1, z2, 'MainMapPlot');

        this._number = number;
        this._area = area;

        this._previousOwners = new Set();
    }

    /**
     * adds the player as a owner of the zone
     * @param {Player} player the new owner
     * @param {Date} fromDate the date since the player is / was the owner
     * @param {Date} tillDate the date till the player is / was the owner
     */
    addOwner(player, fromDate, tillDate) {
        if (!Player.isPlayer(player)) throw new Error('no Player');

        this._previousOwners.add({
            player: player,
            from: fromDate,
            till: tillDate
        });
    }

    /**
     * a set of the previous owners of the plot
     * @type {Set.<Object>}
     * @property {Player} obj.player the previous owner
     * @property {Date} obj.fromDate the date since the player is / was the previous owner
     * @property {Date} obj.tillDate the date till the player is / was the previous owner
     * @readonly
     */
    get previousOwners() {
        return this._previousOwners;
    }

    /**
     * overwrites the set of previousOwners to the value without checking the format (use addOwner instead)
     * @param {Set} previousOwners the previous owners in the format {player: UwmcPlayer, from: Date, till: Date}
     * @private
     */
    _setPreviousOwners(previousOwners) {
        this._previousOwners = previousOwners;
    }

    /**
     * the player that ones the plot, false if no one owns it
     * @type {Player|boolean}
     * @readonly
     */
    get owner() {
        // the current owner doesn't have a till date
        for (let owner of this.previousOwners) {
            if (!owner.till) return owner.player;
        }

        return false;
    }

    /**
     * the number of the plot in the area
     * @type {int}
     */
    get number() {
        return this._number;
    }
    set number(number) {
        this._number = number;
    }

    /**
     * the area the plot is placed in (eg. Neustadt)
     * @type {string}
     */
    get area() {
        return this._area;
    }
    set area(area) {
        this._area = area;
    }

    /**
     * the name of the MainMapPlot like it is viewed on the dynmap (Area Number)
     * @type {string}
     * @readonly
     */
    get name() {
        return `${ this.area } ${ this.number }`;
    }

    /**
     * if the zone has an owner or not
     * @type {boolean}
     * @readonly
     */
    get owned() {
        for (let owner of this.previousOwners) {
            if (!owner.till) return true;
        }

        return false;
    }

    /**
     * checks if the value is an instanceof MainMapPlot
     * @param {Object} plot
     * @return {boolean} true if the plot is a MainMapPlot
     */
    static isMainMapPlot(plot) {
        return plot instanceof MainMapPlot;
    }
}

module.exports = MainMapPlot;