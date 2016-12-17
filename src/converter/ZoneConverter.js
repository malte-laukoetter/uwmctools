const Zone = require('../zones/Zone');

function getCoords(data, num) {
    if(num > 1 && data.length > 2) {
        return data[0] == data[1] ? data[2] : data[1];
    }else{
        return data[num];
    }
}

module.exports = (data, Type=Zone) => {
    let zoneList = [];

    for ( let zoneId in data ) {
        if ({}.hasOwnProperty.call(data, zoneId)) {
            let zoneData = data[zoneId];
            let zone = new Type();

            zone.setPos(
                getCoords(zoneData.x, 0),
                getCoords(zoneData.x,1),
                getCoords(zoneData.z,0),
                getCoords(zoneData.z,1)
            );

            zoneList.push(zone);
        }
    }

    return zoneList;
};
