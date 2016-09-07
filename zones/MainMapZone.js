const Zone = require('./Zone');

/*
 * a zone of the mainmap of unlimitedworld.de
 */
class MainMapZone extends Zone {
    constructor( id, x1, x2, z1, z2, type ) {
        super( x1, x2, z1, z2 );
        this._id = id;
        this._type = type
    }

    /*
     * the zoneid of the zone (something like "uwzone_32123")
     */
    get id() {
        return this._id;
    }

    /*
     * sets the date the zone was created
     */
    set created( date ) {
        if ( !( date instanceof Date ) )
            throw new Error( 'No Date' );

        this._created = date
    }

    /*
     * gets the date the zone was created
     */
    get created() {
        return this._created || new Date( 0 )
    }

    /*
     * sets the date the zone was deleted
     */
    set deleted( date ) {
        if ( !( date instanceof Date ) )
            throw new Error( 'No Date' );

        this._deleted = date
    }

    /*
     * gets the date the zone was deleted or false if the zone isn't deleted
     */
    get deleted() {
        return this._deleted || false
    }

    /*
     * gets the type of the zone (eg. Player)
     */
    get type() {
        return type
    }
}

module.exports = MainMapZone;
