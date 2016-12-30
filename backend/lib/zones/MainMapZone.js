const CreatableZone = require('./CreatableZone');

/**
 * a zone of the mainmap of unlimitedworld.de
 */
class MainMapZone extends CreatableZone {
    /**
     * creates a new Main Map Zone
     * @param {string} id the id of the zone (eg. uwzone_23131)
     * @param {int} x1 the x1 coordinate of the area
     * @param {int} x2 the x2 coordinate of the area
     * @param {int} z1 the z1 coordinate of the area
     * @param {int} z2 the z2 coordinate of the area
     */
    constructor(id = '', x1 = 0, x2 = 0, z1 = 0, z2 = 0) {
        super(x1, x2, z1, z2);
        this._id = id;
    }

    set id(value) {
        this._id = value;
    }

    /**
     * the zoneid of the zone (something like "uwzone_32123")
     * @type {string}
     * @readonly
     */
    get id() {
        return this._id;
    }

    /**
     * the type of the zone (eg. Player)
     * @type {string}
     * @readonly
     */
    get type() {
        return this._type;
    }
}

module.exports = MainMapZone;