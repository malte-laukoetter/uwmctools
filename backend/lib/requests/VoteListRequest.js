const config = require('../config.json');

const Request = require('./Request');
const uuidlockup = require('../uuid');
const UwmcPlayer = require('../player/UwmcPlayer');
const Helper = require('../Helper');

/**
 * request to get the data about the votes of unlimitedworld
 */
class VoteListRequest extends Request {
    /**
     * creates a new VoteListRequest
     */
    constructor() {
        super(config.URLS.UWMC.VOTELIST);
    }

    /**
     * executes the request and converts the data
     * @return {Promise} the votelist
     */
    execute() {
        return super.execute().then(function (res) {
            // convert it to an key -> value object so we can get a list of the names with Object.keys and can get the
            // data of a specific player without iterating throug the array
            return Helper.convertToMap(res.body.data, 'user');
        }).then(function (players) {
            return new Promise(function (resolve, reject) {
                // get the uuids and names in correct capitalization (to get an array of the keys we need to spread the
                // iteratable and add all items to an array)
                uuidlockup.getUuids([...players.keys()], UwmcPlayer).then(function (res) {

                    res = [...res.entries()].map(([name, player]) => {
                        player.setVotes(new Date().getFullYear(), new Date().getMonth(), 'v1', players.get(name).s1);
                        player.setVotes(new Date().getFullYear(), new Date().getMonth(), 'v2', players.get(name).s2);

                        return player;
                    });

                    resolve(res);
                });
            });
        });
    }

    /**
     * adds the data we get from the votelist to the player object
     * @param {UwmcPlayer} player the player the vote data should be added to
     * @param {Object} data the vote data about the player
     * @return {UwmcPlayer} the given Player including the vote data
     * @private
     */
    static _addVoteListDataToPlayer(player, data) {
        player.setVotes(new Date().getFullYear(), new Date().getMonth(), 'v1', data.s1);
        player.setVotes(new Date().getFullYear(), new Date().getMonth(), 'v2', data.s2);

        return player;
    }
}

module.exports = VoteListRequest;