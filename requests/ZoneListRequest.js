const config = require( '../config.json' );

const Request = require( './Request' );
const uuidlockup = require( '../uuid' );
const Player = require( '../player/Player' );
const PlayerZone = require( '../zones/PlayerZone' );
const Helper = require('../Helper');


/*
 * request to get the data about the zones from the dynmap of uwmc.de it also converts the data and saves the player zones to the database
 */
class ZoneListRequest extends Request {
    constructor() {
        super( config.URLS.UWMC.ZONELIST_MAIN )
    }

    /*
     * executes the request, converts the data and saves the player zones to the database
     */
    execute(db) {
        let req = this;

        return super.execute().then( function ( res ) {
            return ZoneListRequest._convertPlayerZones(res.body.sets.Spielerzonen.areas).then(function(zones){
                let dbRequests = []

                for(let zone of zones){
                    dbRequests.push(zone.saveToDb(db));
                }

                return Promise.all(dbRequests).then(function(res){
                    return PlayerZone.setOldZonesToDeleted(db)
                });
            })
        });
    }


    /*
     * converts the player zonelist data into PlayerZones
     */
    static _convertPlayerZones( zones ) {
        return new Promise(function(resolve, reject){
            let players = [];
            for ( let i in zones ) {
                players.push(ZoneListRequest._getZoneOwner(zones[i].label).toLowerCase());
            }


            uuidlockup.getUuids( players ).then( function ( players ) {
                let zoneList = [];

                for ( let zoneId in zones ) {
                    let zoneData = zones[ zoneId ];

                    let playername = ZoneListRequest._getZoneOwner(zoneData.label).toLowerCase()

                    if(players.has(playername)){
                        let zone = new PlayerZone(
                            players.get(playername),
                            ZoneListRequest._getZoneNumber(zoneData.label),
                            zoneId,
                            zoneData.x[0],
                            zoneData.x[1],
                            zoneData.z[0],
                            zoneData.z[1]
                        );

                        zoneList.push( zone )
                    }
                }

                resolve(zoneList)
            } );
        })
    }

    /*
     * generates the zonenumber from the label of a playerzone frome the dynmap
     */
    static _getZoneNumber( label ) {
        let zoneNumber = label.split( /Zonen Nr\.:\s*<b>/ )

        if ( zoneNumber.length > 1 ) {
            zoneNumber = parseInt( zoneNumber[ 1 ].split( '</b>' )[ 0 ] );
        } else {
            zoneNumber = 0;
        }

        return zoneNumber;
    }

    /*
     * generates the name of the zoneowner from the label of a playerzone frome the dynmap
     */
    static _getZoneOwner( label ) {
        let owner = label.split( /color: #[A-F0-9a-f]{6}">(\[.*\])*/ ) //it's working but i don't know how so better don't touch it ;)

        if ( owner.length > 2 ) {
            if ( owner[ 1 ] && owner[ 2 ] == ' </span><span style="' && owner[ 1 ].substring( 0, 1 ) == "[" ) {
                owner = owner[ 4 ].split( '</span>' )[ 0 ];
            } else {
                owner = owner[ 2 ].split( '</span>' )[ 0 ];
            }

            if ( owner.split( ' ' ).length > 1 ) {
                owner = owner.split( ' ' )[ 1 ]
            }

            return owner.toString();
        } else {
            return "Server - Communityzone"
        }
    }
}

module.exports = ZoneListRequest;
