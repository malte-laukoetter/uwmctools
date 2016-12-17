const MongoClient = require( 'mongodb' ).MongoClient;
const assert = require( 'assert' );
const ObjectId = require( 'mongodb' ).ObjectID;
const request = require( 'request' );
const Promise = require( 'promise' );
const UwmcTools = require('uwmctools');

const uuidlockup = require( '../uuid' );
const zones = require( './zones' );
const config = require( '../configs/node.json' );

const firebaseservice = require( '../firebaseservice.js' );

//url of the mongodb database
const MONGODB_URL = 'mongodb://' + (process.env.MONGODB_USERNAME || config.MONGODB.USERNAME) + ':' + (process.env.MONGODB_PW || config.MONGODB.PW) + '@' + config.MONGODB.SERVER + '/' + config.MONGODB.DATABASE.UWMC.NAME;

const UWMC_VOTE_LIST_REQUEST = {
    url: config.URLS.UWMC.VOTELIST,
    json: true
}
const UWMC_ZONELIST_MAIN_REQUEST = {
    url: config.URLS.UWMC.ZONELIST_MAIN,
    json: true
}
const uwtool = new UwmcTools(MONGODB_URL)

function createWorldStatData( zoneListData, size, title ) {
    let data = {}

    data.playerzones = {}

    data.playerzones.amount = zones.zoneAmount( zoneListData.player );
    data.playerzones.area = zones.totalPlayerZoneArea( zoneListData.player );
    data.playerzones.averagesize = Math.floor( zones.averagePlayerZoneArea( data.playerzones.area, data.playerzones.amount ) )

    data.size = size;

    data.serverzones = zones.totalAreaBiggerThan( zoneListData.server, 30 );

    data.free = data.size - data.serverzones - data.playerzones.area;

    data.percent = {};

    data.percent.free = data.free / data.size;
    data.percent.serverzone = data.serverzones / data.size;
    data.percent.playerzone = data.playerzones.area / data.size;

    data.title = title

    return data
}

function stripZonesByZ(zonelist, zMax, zMin, xMax, xMin){
    let newZoneList = {};

    for(zonetype in zonelist){
        newZoneList[zonetype] = [];
        for(zoneid in zonelist[zonetype]){
            let zoneData = zonelist[zonetype][zoneid];
            let centerZ = Math.max(zoneData.z[0], zoneData.z[1]) - 0.5 * zoneData.width;
            let centerX = Math.max(zoneData.x[0], zoneData.x[1]) - 0.5 * zoneData.length;
            if(centerZ > zMin && centerZ <= zMax && centerX > xMin && centerX <= xMax){
                newZoneList[zonetype].push( zoneData )
            }
        }
    }

    return newZoneList;
}

function saveWorldStatData() {
    new Promise( function ( fulfill, reject ) {
        request( UWMC_ZONELIST_MAIN_REQUEST, function ( error, response, body ) {
            if ( !error && response.statusCode == 200 ) {
                zones.convertZoneList( body ).then( function ( zoneListData ) {
                    let data = {};

                    data.full = createWorldStatData( zoneListData, 8000 * 4000 + 2000 * 4000, "Gesamte Karte" );
                    data.main = createWorldStatData( stripZonesByZ(zoneListData, 2000, -2000, 2000, -2000), 4000 * 4000, "Ursprungs Karte" );
                    data.north = createWorldStatData( stripZonesByZ(zoneListData, -2000, -4000, 2000, -2000), 2000 * 4000, "Norden" );
                    data.south = createWorldStatData( stripZonesByZ(zoneListData, 4000, 2000, 2000, -2000), 2000 * 4000, "Süden" );
                    data.east = createWorldStatData( stripZonesByZ(zoneListData, 2000, -2000, 2000, 0), 2000 * 4000, "Osten" );

                    console.log(data)

                    fulfill( data )
                } );
            }
        } );
    } ).then( function ( data ) {
        MongoClient.connect( MONGODB_URL, function ( err, db ) {
            if ( err ) {
                reject( err )
            }
            cursor = db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.MAPSTATS ).insertOne( {
                data: data,
                date: new Date()
            } );
        } );
    } )
}

module.exports = {
    getWorldStatData: function () {
        return getWorldStatData();
    },
    saveWorldStatData: function(){
        return saveWorldStatData();
    }
};
