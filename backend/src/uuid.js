const request = require( 'request' );
const config = require( './config.json' );
const Player = require('./player/Player');

let playerToUuid = new Map();

// players instanceof Set
function getUuids( players, Type=Player ) {
    let unresolvedPlayers = new Set();
    let resolvedPlayers = new Map();

    /*
     * get the cached player data
     */
    for ( let player of players ) {
        player = player.toString().toLowerCase();
        if ( playerToUuid.has( player ) ) {
            resolvedPlayers.set(player, playerToUuid.get(player));
        } else {
            unresolvedPlayers.add(player);
        }
    }

    /*
     * bulking them in blocks of 100 names (max names for one call to the mojang api)
     */
    // amount of blocks needed
    let amountOfMojangRequests = Math.ceil( unresolvedPlayers.size / 100 );
    // array of the blocks
    let requestNameLists = [];

    // generate one clean arrays for each block of names
    for ( let i = 0; i < amountOfMojangRequests; i++ ) {
        requestNameLists.push( [] );
    }

    // so we know which block we are filling and how much space is left
    let currendList = 0;
    let currendListLength = 0;

    // and add the names to the blocks
    for ( let player of unresolvedPlayers.values() ) {
        currendListLength++;

        if ( currendListLength >= 100 ) {
            currendList++;
            currendListLength = 0;
        }

        requestNameLists[currendList].push( player );
    }

    let requests = [];

    for( let list in requestNameLists ) {
        if ({}.hasOwnProperty.call(requestNameLists, list)) {
            let requestOptions = {
                method: 'post',
                body: requestNameLists[list],
                json: true,
                url: config.URLS.MOJANG.PLAYERS_TO_UUID,
            };

            requests.push(new Promise(function (resolve, reject) {
                request(requestOptions, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        // save the uuid and name (with the right case) to the players
                        let players = new Map();

                        for(let i in body) {
                            if ({}.hasOwnProperty.call(body, i)) {
                                let player = new Type(body[i].id);
                                player.name = body[i].name;

                                let name = player.name.toLowerCase();

                                playerToUuid.set(name, player);
                                players.set(name, player);
                            }
                        }

                        resolve(players);
                    } else {
                        reject(err);
                    }
                });
            }));
        }
    }

    return new Promise( function( resolve, reject ) {
        Promise.all( requests ).then( (values) => {
             // combine all the responses of the lookup and the cached values to one map:

             // add all values to one array
            let flatenValues = [...resolvedPlayers];
            for(let val of values) {
                flatenValues.push(...val);
            }

            // add all the values of the array to the map
            let res = new Map(flatenValues);
            resolve( res );
        } ).catch( (err) => reject( err ) );
    } );
}

module.exports = {
    getUuids: function( players, Type ) {
        return getUuids( players, Type );
    },
};
