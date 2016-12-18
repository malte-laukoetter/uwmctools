const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * the EventEmitter for Zone Events
 * @private
 */
class ZoneEmitter extends EventEmitter {}

const emitter = new ZoneEmitter();

/**
 * an area in a 2d grid
 */
class Zone {
    /**
     * creates a new zone
     * @param {int} x1 the x1 coordinate of the zone
     * @param {int} x2 the x2 coordinate of the zone
     * @param {int} z1 the z1 coordinate of the zone
     * @param {int} z2 the z2 coordinate of the zone
     */
    constructor( x1=0, x2=0, z1=0, z2=0 ) {
        this.setPos( x1, x2, z1, z2 );
    }

    /**
     * sets the position of the zone
     * @param {int} x1 the x1 coordinate of the zone
     * @param {int} x2 the x2 coordinate of the zone
     * @param {int} z1 the z1 coordinate of the zone
     * @param {int} z2 the z2 coordinate of the zone
     */
    setPos( x1, x2, z1, z2 ) {
        if ( !this._pos )
            this._pos = {};

        this._pos.x1 = x1;
        this._pos.x2 = x2;
        this._pos.z1 = z1;
        this._pos.z2 = z2;
    }

    /**
     * the position of the zone
     * @type {Object}
     * @property {int} x1 the x1 coordinate of the zone
     * @property {int} x2 the x2 coordinate of the zone
     * @property {int} z1 the z1 coordinate of the zone
     * @property {int} z2 the z2 coordinate of the zone
     * @readonly
     */
    get pos() {
        return this._pos;
    }

    /**
     * the length of the zone
     * @type {int}
     * @readonly
     */
    get length() {
        return Zone.distance( this.pos.x1, this.pos.x2 );
    }

    /**
     * the width of the zone
     * @type {int}
     * @readonly
     */
    get width() {
        return Zone.distance( this.pos.z1, this.pos.z2 );
    }

    /**
     * the center of the zone as an object of the format {x: 0, z: 0}
     * @type {Object}
     * @property {int} x the x coordinate of the center
     * @property {int} z the z coordinate of the center
     * @readonly
     */
    get center() {
        return {
            x: Zone.center( this.pos.x1, this.pos.x2 ),
            z: Zone.center( this.pos.z1, this.pos.z2 ),
        };
    }

    /**
     * the md5 hash of the zone
     * @type {string}
     * @readonly
     */
    get hash() {
        let hashsum = crypto.createHash('md5');

        return hashsum.update(JSON.stringify(this)).digest('hex');
    }

    /**
     * calculates the middle of the two numbers
     * @param {int} a first number
     * @param {int} b second number
     * @return {number} the middle of the two numbers
     */
    static center( a, b ) {
        return Zone.distance( a, b ) * 0.5 + Math.min( a, b );
    }

    /**
     * calculates the distance between the two numbers
     * @param {int} a first number
     * @param {int} b second number
     * @return {number} the distance of the two numbers
     */
    static distance( a, b ) {
        return Math.abs( a - b );
    }

    /**
     * the event emitter for the Zone class (not the emitter for an instance of the Zone)
     * @type {EventEmitter}
     * @readonly
     */
    static get eventEmitter() {
        return emitter;
    }
}

module.exports = Zone;
