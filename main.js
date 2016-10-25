const MongoClient = require( 'mongodb' ).MongoClient;

const PlayerListRequest = require( './requests/PlayerListRequest' );
const ZoneListRequest = require( './requests/ZoneListRequest' );
const PlotListRequest = require( './requests/PlotListRequest' );
const VoteListRequest = require( './requests/VoteListRequest' );
const FreeZonesCalcRequest = require( './requests/FreeZonesCalcRequest' );
const MainMapPlotRequest = require( './requests/MainMapPlotRequest' );
const UwmcPlayer = require( './player/UwmcPlayer' );
const Player = require( './player/Player' );
const MainMapZone = require( './zones/MainMapZone' );
const PlayerZone = require( './zones/PlayerZone' );
const Plot = require( './zones/Plot' );
const ServerZone = require( './zones/ServerZone' );
const Zone = require( './zones/Zone' );

/*
 * Main Class of the uwmc tools
 */
class Main {
    constructor( mongoDbUrl ) {
        this._mongoDbUrl = mongoDbUrl;

        this._playerListRequest = new PlayerListRequest();
        this._zoneListRequest = new ZoneListRequest();
        this._plotListRequest = new PlotListRequest();
        this._voteListRequest = new VoteListRequest();
        this._freeZonesCalcRequest = new FreeZonesCalcRequest();
        this._mainMapPlotRequest = new MainMapPlotRequest();
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
        return this._saveData( this._playerListRequest );
    }

    /*
     * save the data about the zones
     */
    saveZoneListData() {
        return this._saveData( this._zoneListRequest );
    }

    /*
     * save the data about the plots
     */
    savePlotListData() {
        return this._saveData( this._plotListRequest );
    }

    /*
     * save the data from the votelist
     */
    saveVoteListData() {
        return this._saveData( this._voteListRequest );
    }

    /*
     * save the data from the zonelist
     */
    saveMainMapPlotRequest() {
        return this._saveData( this._mainMapPlotRequest );
    }

    /*
     * gets all free Zones of the given length and width
     */
    getFreeZones(length, width) {
        return this._freeZonesCalcRequest.execute(length, width);
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

    /*
     * gets the UwmcPlayer class
     */
    static get UwmcPlayer(){
        return UwmcPlayer;
    }

    /*
     * gets the Player class
     */
    static get Player(){
        return Player;
    }

    /*
     * gets the MainMapZone class
     */
    static get MainMapZone(){
        return MainMapZone;
    }

    /*
     * gets the PlayerZone class
     */
    static get PlayerZone(){
        return PlayerZone;
    }

    /*
     * gets the Plot class
     */
    static get Plot(){
        return Plot;
    }

    /*
     * gets the ServerZone class
     */
    static get ServerZone(){
        return ServerZone;
    }

    /*
     * gets the Zone class
     */
    static get Zone(){
        return Zone;
    }
}

module.exports = Main;
