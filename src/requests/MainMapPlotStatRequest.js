const config = require( '../config.json' );

const Request = require( './Request' );
const mainMapPlotConverter = require('../converter/MainMapPlotConverter');

/**
 * generates a filter function that test if a plot is in an area
 * @param {string} area
 * @return {Function} the generated filter function
 */
function isInArea(area) {
    return function(zone) {
        return zone.area === area;
    };
}

/**
 * generates the statistics for the plots
 * @param {Array.<MainMapPlot>} plots an array of the MainMapPlots
 * @return {{}} an object with the statistics about the plots
 */
function createStats( plots ) {
    return {
        amount: plots.length,
        full: plots.filter((plot) => plot.owned).length,
    };
}

/**
 * request to get the data from the dynmap and calculates all free areas
 */
class MainMapPlotStatRequest extends Request {
    /**
     * creates a new FreeZoneCalcRequest
     */
    constructor() {
        super( config.URLS.UWMC.ZONELIST_MAIN );
    }

    /**
     * executes the request, converts the data, saves it to the database and returns the statistic data
     * @return {Promise} the current statistics
     */
    execute() {
        return super.execute().then(async(res) => {
            const plots = await mainMapPlotConverter(res.body.sets.Neulingszonen.areas);

            let data = {};

            data.all = createStats(plots);

            for(let area of config.MAINMAP_PLOT_AREAS) {
                data[area] = createStats(plots.filter(isInArea(area)));
            }

            return data;
        });
    }
}

module.exports = MainMapPlotStatRequest;
