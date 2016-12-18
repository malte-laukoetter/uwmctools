const config = require('../config.json');

const Request = require('./Request');
const uuidlockup = require('../uuid');
const Plot = require('../zones/Plot');
const plotConverter = require('../converter/PlotConverter');

/**
 * request to get the data about the plots from the dynmap of uwmc.de it also converts the data and saves the plots to
 * the database
 */
class PlotListRequest extends Request {
    /**
     * creates a new PlotListRequest
     */
    constructor() {
        super(config.URLS.UWMC.ZONELIST_CREATIVE);

        this._cache = new Map();
    }

    /**
     * executes the request and initilized the convertion and saving of the data
     * @param {Db} db the database the data should be saved in
     * @return {Promise} result of the database query
     */
    execute(db) {
        let req = this;

        return super.execute().then(function (res) {
            return plotConverter(res.body.sets['plot2.markerset'].areas).then(function (plots) {
                let dbRequests = [];

                // save changed zone data
                for (let plot of plots) {
                    if (req._cache.get(plot.id) !== plot.hash) {
                        req._cache.set(plot.id, plot.hash);
                        dbRequests.push(plot.saveToDb(db));
                    }
                }

                for (let cachedPlotId of req._cache.keys()) {
                    let exist = false;

                    // tests if the plotid of the cached plot is in the results (-> if it exists in the results the
                    // plot still exists)
                    for (let plot of plots) {
                        if (!exist && plot.id === cachedPlotId) {
                            exist = true;
                        }
                    }

                    if (!exist) {
                        dbRequests.push(Plot.fromDb(db, cachedPlotId).then(function (res) {
                            return res.setToDeleted(db);
                        }));

                        req._cache.delete(cachedPlotId);
                    }
                }

                return Promise.all(dbRequests);
            });
        });
    }
}

module.exports = PlotListRequest;