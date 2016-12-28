const config = require( '../config.json' );

const Request = require( './Request' );
const playerZoneConverter = require('../converter/MainMapPlayerZoneConverter');

/**
 * request to get the data about the zones from the dynmap of uwmc.de it also converts the data and saves the player
 * zones to the database
 */
class ZoneListRequest extends Request {
    /**
     * creates a new zonelist request
     */
    constructor() {
        super( config.URLS.UWMC.ZONELIST_MAIN );

        this._cache = new Map();
    }

    /**
     * executes the request, converts the data and saves the player zones to the database
     * @param {Db} db the database the data should be saved in
     * @return {Promise} result of the database query
     */
    execute() {
        return super.execute().then( function( res ) {
            return playerZoneConverter(res.body.sets.Spielerzonen.areas);
        });
    }
}

module.exports = ZoneListRequest;
