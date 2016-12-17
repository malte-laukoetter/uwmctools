const Zone = require('../zones/Zone');

module.exports = (data, Type=Zone) => {
    let zoneList = [];

    for ( let zoneId in data ) {
        if ({}.hasOwnProperty.call(data, zoneId)) {
            let zoneData = data[zoneId];
            let zone = new Type();

            zone.setPos(
                zoneData.x[0],
                zoneData.x[1],
                zoneData.z[0],
                zoneData.z[1]
            );

            zoneList.push(zone);
        }
    }

    return zoneList;
};
