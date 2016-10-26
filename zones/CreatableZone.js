const Zone = require( './Zone' );

/*
 * a zone that can be created and deleted
 */
class CreatableZone extends Zone {
    constructor( x1, x2, z1, z2 ) {
        super( x1, x2, z1, z2 );
    }

    /*
     * sets the date the zone was created
     */
    set created( date ) {
        if ( !( date instanceof Date ) )
            throw new Error( 'No Date' );

        this._created = date;
    }

    /*
     * gets the date the zone was created
     */
    get created() {
        return this._created || new Date( 0 );
    }

    /*
     * sets the date the zone was deleted
     */
    set deleted( date ) {
        if ( !( date instanceof Date ) )
            throw new Error( 'No Date' );

        this._deleted = date;
    }

    /*
     * gets the date the zone was deleted or false if the zone isn't deleted
     */
    get deleted() {
        return this._deleted || false;
    }
}

module.exports = CreatableZone;
