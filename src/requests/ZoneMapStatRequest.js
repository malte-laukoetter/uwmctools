const config = require( '../config.json' );

const Request = require( './Request' );
const playerZoneConverter = require('../converter/MainMapPlayerZoneConverter');
const serverZoneConverter = require('../converter/MainMapServerZoneConverter');

/**
 * calculates the area between the coordinates
 * @param {int} area.z1
 * @param {int} area.z2
 * @param {int} area.x1
 * @param {int} area.x2
 * @return {int} the area
 */
function getArea(area) {
    return Math.abs(area.z1-area.z2) * Math.abs(area.x1-area.x2);
}

/**
 * generates a filter function that test if a zone is between the given coordinates
 * @param {int} z1
 * @param {int} z2
 * @param {int} x1
 * @param {int} x2
 * @return {Function} the generated filter function
 */
function isBetween(z1, z2, x1, x2) {
    return function(zone) {
        return (zone.center.z <= z1 && zone.center.z > z2 && zone.center.x <= x1 && zone.center.x > x2);
    };
}

/**
 * calculates the total area of all the zones
 * @param {Array.<Zone>} zones the zones that total area should be computed
 * @return {int} the total area
 */
function totalZoneArea(zones) {
    return zones.map((zone) => zone.length * zone.width).reduce((a, b) => a + b, 0);
}

/**
 * generates the statistics for the zones
 * @param {Array.<Array.<Zone>>} zoneListData an array with two array where the first has the player zones of the area
 * and the second has the serverzones of the area
 * @param {int} size the size of the area
 * @param {string} title the title of the area
 * @return {{}} an object with the statistics about the zones
 */
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
     * executes the request, converts the data, saves it to the database and returns the statistic data
     * @param {Db} db the database the data should be saved in
     * @return {Promise} the current statistics
     * */
    execute(db) {
        return super.execute().then(async (res) => {
            const zoneListData = [
                await playerZoneConverter(res.body.sets.Spielerzonen.areas),
                serverZoneConverter(res.body.sets.Serverzonen.areas),
            ];

            let data = {};

            const area = config.MAINMAP_AREAS.map(getArea).reduce((a, b) => a+b);
            data.full = createStats(zoneListData, area, 'Gesamte Karte');

            for(const area of config.MAINMAP_AREAS) {
                data[area.id] =
                    createStats(zoneListData.map((data) => data.filter(isBetween(area.z1, area.z2, area.x1, area.x2))),
                        getArea(area), area.label);
            }

            return data;
        }).then((data) => {
           /* db.collection(config.MONGODB.DATABASE.UWMC.COLLECTION.MAPSTATS).insertOne({
                data: data,
                date: new Date(),
            });
*/
            return data;
        });
    }
}

module.exports = ZoneMapStatRequest;
