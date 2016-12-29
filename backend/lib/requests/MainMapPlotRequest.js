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
    }

    /**
     * executes the request, converts the data and saves the player zones to the database
     * @return {Promise} result of the database query
     */
    execute() {
        return super.execute().then(function (res) {
            return mainMapPlotConverter(res.body.sets.Neulingszonen.areas);
        });
    }
}

module.exports = MainMapPlotRequest;