const config = require( '../config.json' );

const Request = require( './Request' );
const PlayerZone = require( '../zones/PlayerZone' );
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
    execute(db) {
        let req = this;

        return super.execute().then( function( res ) {
            return playerZoneConverter(res.body.sets.Spielerzonen.areas).then(function(zones){
                let dbRequests = [];

                // save changed zone data
                for(let zone of zones) {
                    if(req._cache.get(zone.id) !== zone.hash) {
                        req._cache.set(zone.id, zone.hash);
                        dbRequests.push(zone.saveToDb(db));
                    }
                }

                // delete zones that no longer exist
                for(let cachedZoneId of req._cache.keys()) {
                    let exist = false;

                    // test if the zoneid of the cached zone is in the results
                    // (-> if it exists in the reults the zone still exists)
                    for(let zone of zones) {
                        if(!exist && zone.id === cachedZoneId) {
                            exist = true;
                        }
                    }

                    if(!exist) {
                        dbRequests.push(PlayerZone.fromDb(db, cachedZoneId).then(function(res){
                            return res.setToDeleted(db);
                        }));

                        req._cache.delete(cachedZoneId);
                    }
                }

                return Promise.all(dbRequests);
            });
        });
    }
}

module.exports = ZoneListRequest;
