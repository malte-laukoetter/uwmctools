const zoneConverter = require('./ZoneConverter');
const MainMapZone = require('../zones/MainMapZone');

module.exports = (data, Type=MainMapZone) => {
    let zoneList = zoneConverter(data, Type);

    let i = 0;
    for(let zoneId in data) {
        if ({}.hasOwnProperty.call(data, zoneId)) {
            zoneList[i].id = zoneId;
            zoneList[i].type = 'player';
        }
        i++;
    }

    return zoneList;
};
