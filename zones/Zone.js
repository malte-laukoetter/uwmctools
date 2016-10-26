const EventEmitter = require('events');
class ZoneEmitter extends EventEmitter {}
const emitter = new ZoneEmitter();
const crypto = require('crypto');

/*
 * an area in a 2d grid
 */
class Zone {
    constructor( x1, x2, z1, z2 ) {
        this.setPos( x1, x2, z1, z2 );
    }

    /*
     * sets the position of the zone
     */
    setPos( x1, x2, z1, z2 ) {
        if ( !this._pos )
            this._pos = {};

        this._pos.x1 = x1;
        this._pos.x2 = x2;
        this._pos.z1 = z1;
        this._pos.z2 = z2;
    }

    /*
     * gets the position of the zone as an object of the format {x1: 0, x2: 0, z1: 0, z2:0}
     */
    get pos() {
        return this._pos;
    }

    /*
     * gets the length of the zone
     */
    get length() {
        return Zone.distance( this.pos.x1, this.pos.x2 );
    }

    /*
     * gets the width of the zone
     */
    get width() {
        return Zone.distance( this.pos.z1, this.pos.z2 );
    }

    /*
     * gets the center of the zone as an object of the format {x: 0, z: 0}
     */
    get center() {
        return {
            x: Zone.center( this.pos.x1, this.pos.x2 ),
            z: Zone.center( this.pos.z1, this.pos.z2 ),
        };
    }

    get hash() {
        let hashsum = crypto.createHash('md5');

        return hashsum.update(JSON.stringify(this)).digest('hex');
    }

    /*
     * calculates the middle of the tow numbers
     */
    static center( a, b ) {
        return Zone.distance( a, b ) * 0.5 + Math.min( a, b );
    }

    /*
     * calculates the distance between the two numbers
     */
    static distance( a, b ) {
        return Math.abs( a - b );
    }

    /*
     * gets the event emitter for the Zone class (not the emitter for an instance of the Zone)
     */
    static get eventEmitter() {
        return emitter;
    }
}

module.exports = Zone;
