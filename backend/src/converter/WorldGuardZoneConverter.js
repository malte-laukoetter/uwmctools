const zoneConverter = require('./MainMapZoneConverter');
const WorldGuardZone = require('../zones/WorldGuardZone');

/**
 * generates a list of the names of the trusted persons from the label of a plot from the dynmap
 * @param {data} data the data used by the dynmap for the plot
 * @return {Array.<string>} an array of all the names of the players that have trusted rigths on the plot
 */
function getOwners( server, data ) {
    let trusted = [];
    try {
        switch (server) {
            case 'craftstuebchen':
                trusted = data.desc.split( "Owners <span style=\"font-weight:bold;\">" )[1]
                                   .split( "<br/>" )[0].split(', ')
                                   .map((name) => name.toLowerCase())
                                   .filter((name) => name !== '');
                break;
            default:
                trusted = data.desc.split( "Owners <span style=\"font-weight:bold;\">" )[1]
                                   .split( "<br/>" )[0].split(', ')
                                   .map((name) => name.toLowerCase())
                                   .filter((name) => name !== '');
        }

    }catch (err) {
        console.log(err);
        return [];
    }

    return trusted;
}

/**
 * generates a list of the names of the trusted persons from the label of a plot from the dynmap
 * @param {data} data the data used by the dynmap for the plot
 * @return {Array.<string>} an array of all the names of the players that have trusted rigths on the plot
 */
function getMembers( server, data ) {
    let trusted = [];
    try {
        switch (server) {
            case 'craftstuebchen':
                trusted = data.desc.split( "Members <span style=\"font-weight:bold;\">" )[1]
                                   .split( "<br/>" )[0].split(', ')
                                   .map((name) => name.toLowerCase())
                                   .filter((name) => name !== '');
                break;
            default:
                trusted = data.desc.split( "Members <span style=\"font-weight:bold;\">" )[1]
                                   .split( "<br/>" )[0].split(', ')
                                   .map((name) => name.toLowerCase())
                                   .filter((name) => name !== '');
        }
    }catch (err) {
        console.log(err);
        return [];
    }

    return trusted;
}

module.exports = async (server, data, Type=WorldGuardZone) => {
    const zoneList = zoneConverter(data, Type);

    return zoneList.map((zone) => {
        for (let owner of getOwners(server, data[zone.id])) {
            zone.addOwner(owner);
        }

        for (let owner of getMembers(server, data[zone.id])) {
            zone.addMember(owner);
        }

        return zone;
    });
};
