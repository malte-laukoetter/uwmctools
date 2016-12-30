const config = require('../config.json');

const Zone = require('./Zone');
const Player = require('../player/Player');
const CreatableZone = require('./CreatableZone');

/**
 * a Plot of the Creative Map of unlimitedworld
 */
class Plot extends CreatableZone {
    /**
     * creates a new Plot of the creative map
     * @param {int} x1 the x1 coordinate of the plot
     * @param {int} x2 the x2 coordinate of the plot
     * @param {int} z1 the z1 coordinate of the plot
     * @param {int} z2 the z2 coordinate of the plot
     * @param {int} posX the x position of the plot in the creative world
     * @param {int} posZ the z position of the plot in the creative world
     */
    constructor(x1 = 0, x2 = 0, z1 = 0, z2 = 0, posX = 0, posZ = 0) {
        super(x1, x2, z1, z2);

        this._posX = posX;
        this._posZ = posZ;
    }

    /**
     * the id of the plot (something like "ebdf264aabda45708f61f2d7a2bb4758-3/-6")
     * @type {string}
     * @readonly
     */
    get id() {
        return `${ this.posX }|${ this.posZ }`;
    }
    set id(id) {
        this._id = id;
    }

    /**
     * the player that owns the plot
     * @type {Player}
     * @readonly
     */
    get owner() {
        return this._owner;
    }
    set owner(player) {
        this._owner = player;
    }

    /**
     * adds a player to the list of trusted players
     * @param {Player} player the player that should be added
     */
    addTrusted(player) {
        if (!Player.isPlayer(player)) throw new Error('no Player');

        if (!this._trusted) this._trusted = [];

        this._trusted.push(player);
    }

    /**
     * all trusted players of the plot
     * @type {Array.<Player>}
     * @readonly
     */
    get trusted() {
        return this._trusted || [];
    }

    /**
     * the name of the zone like it is viewed on the dynmap (X/Z)
     * @type {string}
     * @readonly
     */
    get name() {
        return `${ this.plotPos.x }/${ this.plotPos.z }`;
    }

    /**
     * the x coordinate of plot position (e.g. 0 for the one in the center or 1 for one of the zone next to it)
     * @type {int}
     */
    get posX() {
        return this._posX;
    }
    set posX(posX) {
        this._posX = posX;
    }

    /**
     * gets the z coordinate of the plot position (e.g. 0 for the one in the center or 1 for one of the zone next to it)
     * @type {int}
     */
    get posZ() {
        return this._posZ;
    }
    set posZ(posZ) {
        this._posZ = posZ;
    }

    /**
     * test if it is a Plot
     * @param {Object} plot the Object that should be tested
     * @return {boolean} true if the object is a Plot
     */
    static isPlot(plot) {
        return plot instanceof Plot;
    }
}

module.exports = Plot;