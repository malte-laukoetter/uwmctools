const uuid = require('./uuid');

function convertZoneList(dynmapMainMarkerData) {
    return new Promise(function (resolve, reject) {
        convertPlayerZones(dynmapMainMarkerData).then(function (data) {
            resolve({
                'server': convertServerZones(dynmapMainMarkerData),
                'player': data
            });
        });
    });
}

function convertServerZones(dynmapMainMarkerData) {
    let zones = dynmapMainMarkerData.sets.Serverzonen.areas;
    let zoneList = [];

    for (zoneId in zones) {
        let zoneData = zones[zoneId];
        let labelData = zoneData.label;

        let zone = {
            x: zoneData.x,
            z: zoneData.z,
            length: Math.max(zoneData.x[0], zoneData.x[1]) - Math.min(zoneData.x[0], zoneData.x[1]),
            width: Math.max(zoneData.z[0], zoneData.z[1]) - Math.min(zoneData.z[0], zoneData.z[1]),
            id: zoneId
        };

        zoneList.push(zone);
    }

    return zoneList;
}

function convertPlayerZones(dynmapMainMarkerData) {
    let zones = dynmapMainMarkerData.sets.Spielerzonen.areas;
    let zoneList = [];

    for (zoneId in zones) {
        let zoneData = zones[zoneId];

        let zone = {
            x: zoneData.x,
            z: zoneData.z,
            length: Math.max(zoneData.x[0], zoneData.x[1]) - Math.min(zoneData.x[0], zoneData.x[1]),
            width: Math.max(zoneData.z[0], zoneData.z[1]) - Math.min(zoneData.z[0], zoneData.z[1]),
            id: zoneId,
            owner: getZoneOwner(zoneData.label),
            number: getZoneNumber(zoneData.label)
        };

        zoneList.push(zone);
    }

    let players = {};

    for (zoneid in zoneList) {
        players[zoneList[zoneid].owner.toLowerCase()] = "";
    }

    players = Object.keys(players);

    return new Promise(function (resolve, reject) {
        uuid.getUuids(players).then(function (res) {
            for (zoneid in zoneList) {
                zoneList[zoneid].owner = res[zoneList[zoneid].owner.toLowerCase()];
            }

            resolve(zoneList);
        }).catch(err => reject(err));
    });
}

function getZoneOwner(label) {
    let owner = label.split(/color: #[A-F0-9a-f]{6}">(\[.*\])*/); //it's working but i don't know how so better don't touch it ;)

    if (owner.length > 2) {
        if (owner[1] && owner[2] == ' </span><span style="' && owner[1].substring(0, 1) == "[") {
            owner = owner[4].split('</span>')[0];
        } else {
            owner = owner[2].split('</span>')[0];
        }

        if (owner.split(' ').length > 1) {
            owner = owner.split(' ')[1];
        }

        return owner.toString();
    } else {
        return "Server - Communityzone";
    }
}

function getZoneNumber(label) {
    let zoneNumber = label.split(/Zonen Nr\.:\s*<b>/);

    if (zoneNumber.length > 1) {
        zoneNumber = parseInt(zoneNumber[1].split('</b>')[0]);
    } else {
        zoneNumber = 0;
    }

    return zoneNumber;
}

module.exports = {
    totalPlayerZoneArea: function (zoneList) {
        let area = 0;
        for (zoneid in zoneList) {
            area += zoneList[zoneid].length * zoneList[zoneid].width;
        }

        return area;
    },
    averagePlayerZoneArea: function (zoneAmount, totalPlayerZoneArea) {
        return zoneAmount / totalPlayerZoneArea;
    },
    zoneAmount: function (zoneList) {
        return zoneList.length;
    },
    totalAreaBiggerThan: function (zoneList, size) {
        let area = 0;
        for (zoneid in zoneList) {
            if (zoneList[zoneid].length > size && zoneList[zoneid].width > size) {
                area += zoneList[zoneid].length * zoneList[zoneid].width;
            }
        }
        return area;
    },
    convertZoneList: function (dynmapMainMarkerData) {
        return convertZoneList(dynmapMainMarkerData);
    },
    convertPlayerZones: function (dynmapMainMarkerData) {
        return convertPlayerZones(dynmapMainMarkerData);
    }
};