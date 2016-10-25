const CreatableZone = require( './CreatableZone' );

/*
 * a zone of the mainmap of unlimitedworld.de
 */
class MainMapZone extends CreatableZone {
    constructor( id, x1, x2, z1, z2, type ) {
        super( x1, x2, z1, z2 );
        this._id = id;
        this._type = type;
    }

    /*
     * the zoneid of the zone (something like "uwzone_32123")
     */
    get id() {
        return this._id;
    }

    /*
     * gets the type of the zone (eg. Player)
     */
    get type() {
        return this._type;
    }

    /*
     * sets the zone to deleted in the database
     */
    setToDeleted( db, collection ) {
        let zone = this;
        this.deleted = new Date();

        return new Promise( function( resolve, reject ) {
            db.collection( collection ).update( {
                zoneId: zone.id
            }, {
                $currentDate: {
                    deleted: true
                }
            } ).then( function ( res ) {
                return res
            } );
        } );
    }
}

module.exports = MainMapZone;
