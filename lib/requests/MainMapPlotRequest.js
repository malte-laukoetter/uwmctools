const config = require('../config.json');

const Request = require('./Request');
const mainMapPlotConverter = require('../converter/MainMapPlotConverter');

/**
 * request to get the data from the dynmap and calculates all free areas
 */
class MainMapPlotRequest extends Request {
    /**
     * creates a new MainMapPlotRequest
     */
    constructor() {
        super(config.URLS.UWMC.ZONELIST_MAIN);

        this._cache = new Map();
    }

    /**
     * executes the request, converts the data and saves the player zones to the database
     * @param {Db} db the database the data should be saved in
     * @return {Promise} result of the database query
     */
    execute(db) {
        let req = this;

        return super.execute().then(function (res) {
            return mainMapPlotConverter(res.body.sets.Neulingszonen.areas).then(function (plots) {
                let dbRequests = [];

                // save changed plot data
                for (let plot of plots) {
                    // set to the uuid of the owner of the plot if there is one otherwise it is set to false
                    let owner = plot.owned ? plot.owner.uuid : false;

                    // test if the cache contains a value about the plot (identified by the current owner),
                    // if this is the case we don't need to update the data in the database
                    if (req._cache.has(plot.id) || req._cache.get(plot.id) !== owner) {
                        req._cache.set(plot.id, owner);
                        dbRequests.push(plot.saveToDb(db).then(function (res) {
                            // if the inserted fields is lower than 1 we haven't inserted anything and just need to
                            // update the owner of the plot
                            if (res.nInserted < 1) {
                                return plot.updateDbOwner(db);
                            }
                        }, function (err) {
                            // if we get the insertion error 11000 (already used _id) we need to update the owner of the
                            // plot
                            if (err.code === 11000) {
                                return plot.updateDbOwner(db);
                            }
                        }));
                    }
                }

                return Promise.all(dbRequests);
            });
        });
    }
}

module.exports = MainMapPlotRequest;