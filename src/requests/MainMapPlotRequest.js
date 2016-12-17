const config = require( '../config.json' );

const Request = require( './Request' );
const uuidlockup = require( '../uuid' );
const MainMapPlot = require('../zones/MainMapPlot');

/**
 * request to get the data from the dynmap and calculates all free areas
 */
class MainMapPlotRequest extends Request {
    /**
     * creates a new MainMapPlotRequest
     */
    constructor() {
        super( config.URLS.UWMC.ZONELIST_MAIN );

        this._cache = new Map();
    }

    /**
     * executes the request, converts the data and saves the player zones to the database
     * @param {Db} db the database the data should be saved in
     * @return {Promise} result of the database query
     */
    execute(db) {
        let req = this;

        return super.execute().then( function( res ) {
            return MainMapPlotRequest._convertMainMapPlots(res.body.sets.Neulingszonen.areas).then(function(plots) {
                let dbRequests = [];

                // save changed plot data
                for(let plot of plots) {
                    // set to the uuid of the owner of the plot if there is one otherwise it is set to false
                    let owner = plot.owned ? plot.owner.uuid : false;

                    // test if the cache contains a value about the plot (identified by the current owner),
                    // if this is the case we don't need to update the data in the database
                    if(req._cache.has(plot.id) || req._cache.get(plot.id) !== owner) {
                        req._cache.set(plot.id, owner);
                        dbRequests.push(plot.saveToDb(db).then(function(res) {
                            // if the inserted fields is lower than 1 we haven't inserted anything and just need to
                            // update the owner of the plot
                            if(res.nInserted < 1) {
                                return plot.updateDbOwner(db);
                            }
                        }, function(err) {
                            // if we get the insertion error 11000 (already used _id) we need to update the owner of the
                            // plot
                            if(err.code === 11000) {
                                return plot.updateDbOwner(db);
                            }
                        }));
                    }
                }

                return Promise.all(dbRequests);
            });
        });
    }

    /**
     * converts the plot plotlist data into {@see MainMapPlots}
     * @param {Object} zones the zone data from the request
     * @return {Promise.<Array.<MainMapPlot>>} the MainMapPlots that can be created with the data
     * @private
     */
    static _convertMainMapPlots( zones ) {
        return new Promise(function(resolve, reject) {
            let players = [];
            for ( let zone in zones ) {
                if ({}.hasOwnProperty.call(zones, zone)) {
                    let owner = MainMapPlotRequest._getOwner(zones[zone].label);

                    if (owner) {
                        players.push(owner.toLowerCase());
                    }
                }
            }

            uuidlockup.getUuids( players ).then( function( players ) {
                let zoneList = [];

                for ( let zoneId in zones ) {
                    if ({}.hasOwnProperty.call(zones, zoneId)) {
                        let zoneData = zones[zoneId];

                        let owner = MainMapPlotRequest._getOwner(zoneData.label);
                        let name = MainMapPlotRequest._getName(zoneData.label);

                        let plot = new MainMapPlot(
                            zoneId,
                            name.split(/ /)[0],
                            name.split(/ /)[1],
                            zoneData.x[0],
                            zoneData.x[1],
                            zoneData.z[0],
                            zoneData.z[1]
                        );

                        if (owner && players.has(owner.toLowerCase())) {
                            plot.addOwner(players.get(owner.toLowerCase()), new Date(), null);
                        }

                        zoneList.push(plot);
                    }
                }

                resolve(zoneList);
            } );
        });
    }

    /**
     * generates the name of the owner of a main map plot from the label of a main map plot from the dynmap
     * @param {string} label the label used by the dynmap about the plot
     * @return {boolean|string} the name of the owner or false if the plot dosn't have an owner
     * @private
     */
    static _getOwner( label ) {
        let owner = label.split( 'font-weight:bold">' )[1].split('</span')[0];

        return (owner === 'Plot verfügbar') ? false : owner;
    }

    /**
     * generates the name of a main map plot from the label of a main map plot from the dynmap
     * @param {string} label the label used by the dynmap about the plot
     * @return {string} the name of the plot
     * @private
     */
    static _getName( label ) {
        return label.split( 'font-size:16px">' )[1].split('</p')[0];
    }
}

module.exports = MainMapPlotRequest;
