const config = require( '../config.json' );

const Request = require( './Request' );
const playerZoneConverter = require('../converter/MainMapPlayerZoneConverter');
const serverZoneConverter = require('../converter/MainMapServerZoneConverter');

function isBetween(z1, z2, x1, x2) {
    return function(zone) {
        return (zone.center.z <= z1 && zone.center.z > z2 && zone.center.x <= x1 && zone.center.x > x2);
    };
}

function totalZoneArea(zones) {
    return zones.map((zone) => zone.length * zone.width).reduce((a, b) => a + b, 0);
}

function createStats( zoneListData, size, title ) {
    let data = {};

    data.playerzones = {};

    data.playerzones.amount = zoneListData[0].length;
    data.playerzones.area = totalZoneArea( zoneListData[0] );
    data.playerzones.averagesize = Math.floor(data.playerzones.area / data.playerzones.amount) || 0;

    data.size = size;

    data.serverzones = totalZoneArea(zoneListData[1].filter((zone) => !zone.isWayOrRail()));

    data.free = data.size - data.serverzones - data.playerzones.area;

    data.percent = {};

    data.percent.free = data.free / data.size;
    data.percent.serverzone = data.serverzones / data.size;
    data.percent.playerzone = data.playerzones.area / data.size;

    data.title = title;

    return data;
}

/**
 * request to get the data from the dynmap and calculates all free areas
 */
class ZoneMapStatRequest extends Request {
    /**
     * creates a new FreeZoneCalcRequest
     */
    constructor() {
        super( config.URLS.UWMC.ZONELIST_MAIN );
    }

    /**
     * executes the request, converts the data and returns an array of all free zones
     */
    execute(db) {
        return super.execute().then(async (res) => {
            const zoneListData = [
                await playerZoneConverter(res.body.sets.Spielerzonen.areas),
                serverZoneConverter(res.body.sets.Serverzonen.areas),
            ];

            let data = {};

            data.full = createStats(zoneListData, 8000 * 4000 + 2000 * 4000, 'Gesamte Karte');
            data.main = createStats(zoneListData.map((data) => data.filter(isBetween(2000, -2000, 2000, -2000))),
                4000 * 4000, 'Ursprungs Karte');
            data.north = createStats(zoneListData.map((data) => data.filter(isBetween(-2000, -4000, 2000, -2000))),
                2000 * 4000, 'Norden');
            data.south = createStats(zoneListData.map((data) => data.filter(isBetween(4000, 2000, 2000, -2000))),
                2000 * 4000, 'Süden');
            data.east = createStats(zoneListData.map((data) => data.filter(isBetween(2000, -2000, 2000, 4000))),
                2000 * 4000, 'Osten');

            return data;
        }).then((data) => {
            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.MAPSTATS ).insertOne( {
                data: data,
                date: new Date(),
            } );

            return data;
        });
    }
}

module.exports = ZoneMapStatRequest;
