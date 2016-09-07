const config = require( '../config.json' );

const Request = require( './Request' );
const uuidlockup = require( '../uuid' );
const Player = require( '../player/Player' );
const Plot = require( '../zones/Plot' );

/*
 * request to get the data about the plots from the dynmap of uwmc.de it also converts the data and saves the plots to the database
 */
class PlotListRequest extends Request {
    constructor() {
        super( config.URLS.UWMC.ZONELIST_CREATIVE )
    }

    /*
     * executes the request and initilized the convertion and saving of the data
     */
    execute(db) {
        let req = this;

        return super.execute().then( function ( res ) {
            return PlotListRequest._convertPlots(res.body.sets[ "plot2.markerset" ].areas).then(function(plots){
                let dbRequests = []

                for(let plot of plots){
                    dbRequests.push(plot.saveToDb(db));
                }

                return Promise.all(dbRequests).then(function(res){
                    return Plot.setOldPlotsToDeleted(db)
                });
            })
        });
    }


    /*
     * converts the data of the dynmap into Plot objects
     */
    static _convertPlots( plots ) {
        return new Promise(function(resolve, reject){

            let players = new Set();
            for ( let i in plots ) {
                let plot = plots[i]

                players.add(PlotListRequest._getOwner(plot.desc));

                for ( let trusted of PlotListRequest._getTrusted(plot.desc) ) {
                    players.add(trusted.toLowerCase());
                }
            }

            uuidlockup.getUuids( players ).then( function ( players ) {
                let plotList = [];

                for ( let i in plots ) {
                    let plotData = plots[i]
                    let playername = PlotListRequest._getOwner(plotData.desc).toLowerCase()

                    if(players.has(playername)){
                        let player = players.get(playername);

                        let plotCoords = PlotListRequest._getPlotCoords(plotData.x, plotData.z)

                        let plot = new Plot(
                            player,
                            plotCoords[0],
                            plotCoords[1],
                            plotCoords[2],
                            plotCoords[3],
                            plotData.label.split( ";" )[ 0 ],
                            plotData.label.split( ";" )[ 1 ]
                        )

                        //add the trusted players
                        for ( let trusted of PlotListRequest._getTrusted(plotData.desc) ) {
                            if(players.has(trusted.toLowerCase())){
                                plot.addTrusted(players.get(trusted.toLowerCase()));
                            }
                        }

                        plotList.push(plot);
                    }
                }

                resolve(plotList)
            } );
        })
    }

    /*
     * generates a list of the names of the trusted persons from the label of a plot from the dynmap
     */
    static _getTrusted( label ) {
        let trusted = label.split( /Trusted:\<\/b\> */ )[ 1 ].split( /\<br\>/ )[ 0 ].split( ", " );

         if ( trusted[ 0 ] == 'Keine' )
             trusted = [];

        return trusted
    }

    /*
     * generates the name of the plot owner from the label of a plot from the dynmap
     */
    static _getOwner( label ) {
        return label.split( /Owner:\<\/b\> / )[ 1 ].split( /\<br\>/ )[ 0 ]
    }

    /*
     * generates the coordinates of the zone
     */
    static _getPlotCoords( x, z ){
        //the dynmap returns 4 coordinates for x and z but only 2 are different (eg. [12, 43, 43, 12]) but the order in which they apear isn't the same so we needed
        //to test if the first and the second positions are the same to dicide wich we should use for the second position        
        return [
            x[ 0 ],
            x[ 0 ] == x[ 1 ] ? x[ 2 ] : x[ 1 ],
            z[ 0 ],
            z[ 0 ] == z[ 1 ] ? z[ 2 ] : z[ 1 ]
        ]
    }
}

module.exports = PlotListRequest;
