const CreatableZone = require( './CreatableZone' );

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
     * @param {string} type the type of the zone (eg. player or server)
     */
    constructor( id, x1, x2, z1, z2, type ) {
        super( x1, x2, z1, z2 );
        this._id = id;
        this._type = type;
    }

    /**
     * the zoneid of the zone (something like "uwzone_32123")
     * @return {string} the zoneid of the zone
     */
    get id() {
        return this._id;
    }

    /**
     * gets the type of the zone (eg. Player)
     * @return {string} the type of the zone
     */
    get type() {
        return this._type;
    }

    /**
     * sets the zone to deleted in the database
     * @param {Db} db the database in that the zone should be set to deleted
     * @param {string} collection the collection of the database the zone is saved in
     * @return {Promise} the result of the database query
     */
    setToDeleted( db, collection ) {
        let zone = this;
        this.deleted = new Date();

        return new Promise( function( resolve, reject ) {
            db.collection( collection ).update( {
                zoneId: zone.id,
            }, {
                $currentDate: {
                    deleted: true,
                },
            } ).then( function( res ) {
                return res;
            } );
        } );
    }
}

module.exports = MainMapZone;
