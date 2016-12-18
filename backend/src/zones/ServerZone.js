const MainMapZone = require('./MainMapZone');

/**
 * a ServerZone of the mainmap of unlimitedworld
 */
class ServerZone extends MainMapZone {
    /**
     * creates a new ServerZone
     * @param {string} id the id of the zone (eg. uwzone_23131)
     * @param {int} x1 the x1 coordinate of the zone
     * @param {int} x2 the x2 coordinate of the zone
     * @param {int} z1 the z1 coordinate of the zone
     * @param {int} z2 the z2 coordinate of the zone
     */
    constructor( id='', x1=0, x2=0, z1=0, z2=0 ) {
        super( id, x1, x2, z1, z2, 'Server' );
    }

    /**
     * test if the zone is likely a railroad or a way (eg. the smaller side is under 30 blocks)
     * @return {boolean} true if the zone is likely a railroad or a way
     */
    isWayOrRail() {
        return Math.min( this.length, this.width ) < 30;
    }
}

module.exports = ServerZone;
