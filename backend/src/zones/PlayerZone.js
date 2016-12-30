const config = require( '../config.json' );

const MainMapZone = require( './MainMapZone' );
const Zone = require( './Zone' );
const Player = require( '../player/Player' );

/**
 * a zone of a player on the mainmap of unlimitedworld
 */
class PlayerZone extends MainMapZone {
    /**
     * creates a new Player Zone
     * @param {int} number the zonenumber of the zone (unique per player)
     * @param {string} id the id of the zone (eg. uwzone_23131)
     * @param {int} x1 the x1 coordinate of the area
     * @param {int} x2 the x2 coordinate of the area
     * @param {int} z1 the z1 coordinate of the area
     * @param {int} z2 the z2 coordinate of the area
     */
    constructor( number=0, id='', x1=0, x2=0, z1=0, z2=0 ) {
        super( id, x1, x2, z1, z2, 'Player' );

        this._number = number;
    }

    /**
     * the player that owns the zone
     * @type {Player}
     */
    get player() {
        return this._player;
    }
    set player(player) {
        if(!(player instanceof Player))
            throw new Error('no Player');

        this._player = player;
    }

    /**
     * the number of the zone (uniqe per player)
     * @type {int}
     * @readonly
     */
    get number() {
        return this._number;
    }
    set number(number) {
        this._number = number;
    }

    /**
     * the name of the zone like it is viewed on the dynmap (PlayerName#Number)
     * @type {string}
     * @readonly
     */
    get name() {
        return `${this.player.name}#${this.number}`;
    }

    /**
     * true if the value is an instanceof PlayerZone
     * @param {Object} zone the Object that should be tested
     * @return {boolean} true if the object is a PlayerZone
     */
    static isPlayerZone( zone ) {
        return zone instanceof PlayerZone;
    }
}

module.exports = PlayerZone;
