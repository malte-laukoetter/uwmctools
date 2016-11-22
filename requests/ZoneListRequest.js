const config = require( '../config.json' );

const Request = require( './Request' );
const uuidlockup = require( '../uuid' );
const PlayerZone = require( '../zones/PlayerZone' );
const ServerZone = require( '../zones/ServerZone' );


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

        return super.execute().then( function ( res ) {
            return ZoneListRequest._convertPlayerZones(res.body.sets.Spielerzonen.areas).then(function(zones){
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

    /**
     * converts the player zonelist data into {@link PlayerZone}s
     * @param {Object} zones the zone data from the request
     * @return {Promise.<Array.<PlayerZone>>} the data converted to {@link PlayerZone}s
     * @private
     */
    static _convertPlayerZones( zones ) {
        return new Promise(function(resolve, reject) {
            let players = [];
            for( let i in zones ) {
                if ({}.hasOwnProperty.call(zones, i)) {
                    players.push(ZoneListRequest._getZoneOwner(zones[i].label).toLowerCase());
                }
            }

            uuidlockup.getUuids( players ).then( function( players ) {
                let zoneList = [];

                for( let zoneId in zones ) {
                    if ({}.hasOwnProperty.call(zones, zoneId)) {
                        let zoneData = zones[zoneId];

                        let playername = ZoneListRequest._getZoneOwner(zoneData.label).toLowerCase();

                        if (players.has(playername)) {
                            let zone = new PlayerZone(
                                players.get(playername),
                                ZoneListRequest._getZoneNumber(zoneData.label),
                                zoneId,
                                zoneData.x[0],
                                zoneData.x[1],
                                zoneData.z[0],
                                zoneData.z[1]
                            );

                            zoneList.push(zone);
                        }
                    }
                }

                resolve(zoneList);
            } );
        });
    }

    /**
     * converts the server zonelist data into {@link ServerZone}s
     * @param {Object} zones the zone data from the request
     * @return {Promise.<Array.<ServerZone>>} the data converted to {@link ServerZone}s
     * @private
     */
    static _convertServerZones( zones ) {
        let zoneList = [];

        for( let zoneId in zones ) {
            if ({}.hasOwnProperty.call(zones, zoneId)) {
                let zoneData = zones[zoneId];


                let zone = new ServerZone(
                    zoneId,
                    zoneData.x[0],
                    zoneData.x[1],
                    zoneData.z[0],
                    zoneData.z[1]
                );

                zoneList.push(zone);
            }
        }

        return new Promise(function(resolve) {
            resolve(zoneList);
        });
    }

    /**
     * generates the zonenumber from the label of a {@link PlayerZone} from the dynmap
     * @param {string} label the label used by the dynmap about the zone
     * @return {int} the number of the zone
     * @private
     */
    static _getZoneNumber( label ) {
        let zoneNumber = label.split( /Zonen Nr\.:\s*<b>/ );

        if ( zoneNumber.length > 1 ) {
            zoneNumber = parseInt( zoneNumber[1].split( '</b>' )[0] );
        } else {
            zoneNumber = 0;
        }

        return zoneNumber;
    }

    /**
     * generates the name of the zoneowner from the label of a {@link PlayerZone} from the dynmap
     * @param {string} label the label used by the dynmap about the zone
     * @return {string} the name of the owner of the zone
     * @private
     */
    static _getZoneOwner( label ) {
        // get the owner by some regex (it's so complicated because some names appear in different colors
        let owner = label.split( /color: #[A-F0-9a-f]{6}">(\[.*])*/ );

        if ( owner.length > 2 ) {
            if ( owner[1] && owner[2] == ' </span><span style="' && owner[1].substring( 0, 1 ) == '[' ) {
                owner = owner[4].split( '</span>' )[0];
            } else {
                owner = owner[2].split( '</span>' )[0];
            }

            if ( owner.split( ' ' ).length > 1 ) {
                owner = owner.split( ' ' )[1];
            }

            return owner.toString();
        } else {
            // if the length is smaler two the zone don't have any information about an owner and therefor is a
            // community zone
            return 'Server - Communityzone';
        }
    }
}

module.exports = ZoneListRequest;
