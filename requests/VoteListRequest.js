const config = require( '../config.json' );

const Request = require( './Request' );
const uuidlockup = require( '../uuid' );
const UwmcPlayer = require( '../player/UwmcPlayer' );
const Helper = require('../Helper');


/**
 * request to get the data about the votes of unlimitedworld and saves them to the playerobjects of the database
 */
class VoteListRequest extends Request {
    /**
     * creates a new VoteListRequest
     */
    constructor() {
        super( config.URLS.UWMC.VOTELIST );
    }

    /*
     * executes the request, converts the data and saves it to the DB
     */
    execute(db) {
        let req = this;

        return super.execute().then( function( res ) {
            // convert it to an key -> value object so we can get a list of the names with Object.keys and can get the
            // data of a specific player without iterating throug the array
            req._lastResponse = Helper.convertToMap( res.body.data, 'user' );

            return req.lastResponse;
        } ).then( function( players ) {
            return new Promise( function( resolve, reject ) {
                // get the uuids and names in correct capitalization (to get an array of the keys we need to spread the
                // iteratable and add all items to an array)
                uuidlockup.getUuids( [...players.keys()] ).then( function( res ) {
                    // array of all the Promises needed to save the data of all players, so it's possible to resolve the
                    // current Promise after all are finished
                    let playerToDbIter = [];

                    for( let i in res ) {
                        if ({}.hasOwnProperty.call(res, i)) {
                            playerToDbIter.push(
                                VoteListRequest._saveToDb(db, res[i].id, res[i].name, players.get(i))
                            );
                        }
                    }

                    resolve(Promise.all(playerToDbIter));
                } );
            } );
        } );
    }

    /*
     * gets the last response of the request (unconverted)
     */
    get lastResponse() {
        return this._lastResponse;
    }

    /*
     * saves the data about the player and the votes to the database
     */
    static _saveToDb(db, uuid, name, data) {
        return UwmcPlayer.createFromDb( db, uuid ).then( function( player ) {
            player.name = name;

            player = VoteListRequest._addVoteListDataToPlayer(player, data);

            return player.saveToDb( db );
        });
    }

    /*
     * adds the data we get from the votelist to the player object
     */
    static _addVoteListDataToPlayer(player, data) {
        player.setVotes(new Date().getFullYear(), new Date().getMonth(), 'v1', data.s1);
        player.setVotes(new Date().getFullYear(), new Date().getMonth(), 'v2', data.s2);

        return player;
    }
}

module.exports = VoteListRequest;
