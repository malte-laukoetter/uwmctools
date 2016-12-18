const zoneConverter = require('./MainMapZoneConverter');
const ServerZone = require('../zones/ServerZone');

module.exports = (data, Type = ServerZone) => {
    return zoneConverter(data, Type);
};