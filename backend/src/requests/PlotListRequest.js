const config = require( '../config.json' );

const Request = require( './Request' );
const uuidlockup = require( '../uuid' );
const Plot = require( '../zones/Plot' );
const plotConverter = require('../converter/PlotConverter');

/**
 * request to get the data about the plots from the dynmap of uwmc.de it also converts the data
 */
class PlotListRequest extends Request {
    /**
     * creates a new PlotListRequest
     */
    constructor() {
        super( config.URLS.UWMC.ZONELIST_CREATIVE );
    }

    /**
     * executes the request and converts the data
     * @return {Promise} the plot list
     */
    execute() {
        return super.execute().then( function( res ) {
            return plotConverter(res.body.sets['plot2.markerset'].areas);
        });
    }
}

module.exports = PlotListRequest;
