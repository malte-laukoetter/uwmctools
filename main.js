const MongoClient = require( 'mongodb' ).MongoClient;

const PlayerListRequest = require( './requests/PlayerListRequest' );
const ZoneListRequest = require( './requests/ZoneListRequest' );
const PlotListRequest = require( './requests/PlotListRequest' );
const VoteListRequest = require( './requests/VoteListRequest' );
const UwmcPlayer = require( './player/UwmcPlayer' );

/*
 * Main Class of the uwmc tools
 */
class Main {
    constructor( mongoDbUrl ) {
        this._mongoDbUrl = mongoDbUrl;
    }

    /*
     * gets the url of the mongodb database
     */
    get mongoDbUrl() {
        return this._mongoDbUrl;
    }

    /*
     * connect to the database
     */
    connect() {
        let main = this;
        return new Promise( function ( resolve, reject ) {
            MongoClient.connect( main.mongoDbUrl, function ( err, db ) {
                if ( err )
                    reject( err )

                resolve( db )
            } );
        } );
    }

    /*
     * save the data from the playerlist
     */
    savePlayerListData() {
        return this._saveData( new PlayerListRequest() );
    }

    /*
     * save the data about the zones
     */
    saveZoneListData() {
        return this._saveData( new ZoneListRequest() );
    }

    /*
     * save the data about the plots
     */
    savePlotListData() {
        return this._saveData( new PlotListRequest() );
    }

    /*
     * save the data from the zonelist
     */
    saveVoteListData() {
        return this._saveData( new VoteListRequest() );
    }

    /*
     * get the information about the player with the given uuid
     */
    getPlayer(uuid) {
        return this.connect().then(function( db ){
            return UwmcPlayer.createFromDb(db, uuid);
        })
    }

    /*
     * converts the rank id of an rank to the coresponding name
     */
    static rankToRankName(rank){
        return UwmcPlayer.rankToRankName(rank)
    }

    /*
     * save the data of the request
     */
    _saveData( request ) {
        return this.connect().then( function ( db ) {
            return request.execute( db ).then( function ( res ) {
                db.close();
                return res;
            } );
        } )
    }
}

module.exports = Main;
