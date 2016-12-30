const Zone = require( './Zone' );

/**
 * a zone that can be created and deleted
 */
class CreatableZone extends Zone {
    /**
     * constructor for CreatableZone
     * @param {int} x1 the x1 coordinate of the area
     * @param {int} x2 the x2 coordinate of the area
     * @param {int} z1 the z1 coordinate of the area
     * @param {int} z2 the z2 coordinate of the area
     */
    constructor( x1, x2, z1, z2 ) {
        super( x1, x2, z1, z2 );
    }

    /**
     * the date the zone was created
     * @type {Date}
     */
    get created() {
        return this._created || new Date( 0 );
    }
    set created( date ) {
        if ( !( date instanceof Date ) )
            throw new Error( 'No Date' );

        this._created = date;
    }

    /**
     * the date the zone was deleted, false if the zone isn't deleted
     * @type {Date|Boolean}
     */
    get deleted() {
        return this._deleted || false;
    }
    set deleted(date) {
        if ( !( date instanceof Date || date instanceof Boolean) )
            throw new Error( 'No Date' );

        this._deleted = date;
    }
}

module.exports = CreatableZone;
