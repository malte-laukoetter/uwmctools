const config = require( '../config.json' );

const Request = require( './Request' );
const uuidlockup = require( '../uuid' );
const Plot = require( '../zones/Plot' );

/**
 * request to get the data about the plots from the dynmap of uwmc.de it also converts the data and saves the plots to
 * the database
 */
class PlotListRequest extends Request {
    /**
     * creates a new PlotListRequest
     */
    constructor() {
        super( config.URLS.UWMC.ZONELIST_CREATIVE );

        this._cache = new Map();
    }

    /**
     * executes the request and initilized the convertion and saving of the data
     * @param {Db} db the database the data should be saved in
     * @return {Promise} result of the database query
     */
    execute(db) {
        let req = this;

        return super.execute().then( function( res ) {
            return PlotListRequest._convertPlots(res.body.sets['plot2.markerset'].areas).then(function(plots) {
                let dbRequests = [];

                // save changed zone data
                for(let plot of plots) {
                    if(req._cache.get(plot.id) !== plot.hash) {
                        req._cache.set(plot.id, plot.hash);
                        dbRequests.push(plot.saveToDb(db));
                    }
                }

                for(let cachedPlotId of req._cache.keys()) {
                    let exist = false;

                    // tests if the plotid of the cached plot is in the results (-> if it exists in the results the
                    // plot still exists)
                    for(let plot of plots) {
                        if(!exist && plot.id === cachedPlotId) {
                            exist = true;
                        }
                    }

                    if(!exist) {
                        dbRequests.push(Plot.fromDb(db, cachedPlotId).then(function(res) {
                            return res.setToDeleted(db);
                        }));

                        req._cache.remove(cachedPlotId);
                    }
                }

                return Promise.all(dbRequests);
            });
        });
    }


    /**
     * converts the data of the dynmap into Plot objects
     * @param {Object} plots the plot data from the request
     * @return {Promise.<Array.<Plot>>} a Promise of the Plots created by the data
     * @private
     */
    static _convertPlots( plots ) {
        return new Promise(function(resolve, reject) {
            let players = new Set();
            for( let i in plots ) {
                let plot = plots[i];

                players.add(PlotListRequest._getOwner(plot.desc));

                for ( let trusted of PlotListRequest._getTrusted(plot.desc) ) {
                    players.add(trusted.toLowerCase());
                }
            }

            uuidlockup.getUuids( players ).then( function ( players ) {
                let plotList = [];

                for( let i in plots ) {
                    let plotData = plots[i];
                    let playername = PlotListRequest._getOwner(plotData.desc).toLowerCase();

                    if(players.has(playername)) {
                        let player = players.get(playername);

                        let plotCoords = PlotListRequest._getPlotCoords(plotData.x, plotData.z);

                        let plot = new Plot(
                            player,
                            plotCoords[0],
                            plotCoords[1],
                            plotCoords[2],
                            plotCoords[3],
                            plotData.label.split( ';' )[ 0 ],
                            plotData.label.split( ';' )[ 1 ]
                        );

                        // add the trusted players
                        for ( let trusted of PlotListRequest._getTrusted(plotData.desc) ) {
                            if(players.has(trusted.toLowerCase())) {
                                plot.addTrusted(players.get(trusted.toLowerCase()));
                            }
                        }

                        plotList.push(plot);
                    }
                }

                resolve(plotList);
            } );
        });
    }

    /**
     * generates a list of the names of the trusted persons from the label of a plot from the dynmap
     * @param {string} label the label used by the dynmap for the plot
     * @return {Array.<string>} an array of all the names of the players that have trusted rigths on the plot
     * @private
     */
    static _getTrusted( label ) {
        let trusted = label.split( /Trusted:<\/b> */ )[1].split( /<br>/ )[0].split(', ');

        if( trusted[0] == 'Keine' )
            trusted = [];

        return trusted;
    }

    /**
     * generates the name of the plot owner from the label of a plot from the dynmap
     * @param {string} label the label used by the dynmap for the plot
     * @return {string} the name of the owner of the plot
     * @private
     */
    static _getOwner( label ) {
        return label.split( /Owner:<\/b> / )[ 1 ].split( /<br>/ )[0];
    }

    /**
     * generates the coordinates of the zone from the data from the dynmap
     *
     * the dynmap returns 4 coordinates for x and z but only 2 are different (eg. [12, 43, 43, 12]) but the order in
     * which they appear isn't the same so we needed to test if the first and the second positions are the same to
     * decide which we should use for the second position
     *
     * @param {Array.<int>} x the data about the x coordinate of the plot
     * @param {Array.<int>} z the data about the z coordinate of the plot
     * @return {Array.<int>} an array that has the data the 2 x and 2 z borders of the plot
     * @private
     */
    static _getPlotCoords( x, z ) {
        // the dynmap returns 4 coordinates for x and z but only 2 are different (eg. [12, 43, 43, 12]) but the order in
        // which they appear isn't the same so we needed to test if the first and the second positions are the same to
        // decide which we should use for the second position
        return [
            x[0],
            x[0] == x[1] ? x[2] : x[1],
            z[0],
            z[0] == z[1] ? z[2] : z[1],
        ];
    }
}

module.exports = PlotListRequest;
