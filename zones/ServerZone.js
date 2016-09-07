const Zone = require('./Zone');

/*
 * a ServerZone of the mainmap of unlimitedworld
 */
class ServerZone extends MainMapZone {
    constructor( id, x1, x2, z1, z2 ) {
        super( id, x1, x2, z1, z2, 'Server' );
    }

    /*
     * returns true if the zone is mostelikley a railroad or a way (eg. the smaller side is under 30 blocks)
     */
    isWayOrRail() {
        return Math.min( this.length, this.width ) < 30;
    }
}

module.exports = ServerZone;
