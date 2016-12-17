const zoneConverter = require('./MainMapZoneConverter');
const playerConverter = require('./PlayerConverter');
const PlayerZone = require('../zones/PlayerZone');

/**
 * generates the name of the zoneowner from the data of a {@link PlayerZone} from the dynmap
 * @param {object} zone the zonedata used by the dynmap
 * @return {string} the name of the owner of the zone
 * @private
 */
function getZoneOwner(zone) {
    const label = zone.label;

    // get the owner by some regex (it's so complicated because some names appear in different colors
    let owner = label.split( /color: #[A-F0-9a-f]{6}">(\[.*])*/ );

    if ( owner.length > 2 ) {
        if ( owner[1] && owner[2] == ' </span><span style="' && owner[1].substring( 0, 1 ) == '[' ) {
            owner = owner[4].split( '</span>' )[0];
        } else {
            owner = owner[2].split( '</span>' )[0];
        }

        if ( owner.split( ' ' ).length > 1 ) {
            owner = owner.split( ' ' )[1];
        }

        return owner.toString().toLowerCase();
    } else {
        // if the length is smaler two the zone don't have any information about an owner and therefor is a
        // community zone
        return 'Server - Communityzone'.toLowerCase();
    }
}

/**
 * generates the zonenumber from the label of a {@link PlayerZone} from the dynmap
 * @param {object} zone the zonedata used by the dynmap
 * @return {int} the number of the zone
 * @private
 */
function getZoneNumber( zone ) {
    const label = zone.label;

    let zoneNumber = label.split( /Zonen Nr\.:\s*<b>/ );

    if ( zoneNumber.length > 1 ) {
        zoneNumber = parseInt( zoneNumber[1].split( '</b>' )[0] );
    } else {
        zoneNumber = 0;
    }

    return zoneNumber;
}

async function convertMainMapPlayerZones(data, Type=PlayerZone) {
    const zoneList = zoneConverter(data, Type);
    const playerNames = Object.values(data).map(getZoneOwner);
    const players = await playerConverter(playerNames);

    return zoneList
    .filter((zone) => players.has(getZoneOwner(data[zone.id])))
    .map((zone) => {
        zone.player = players.get(getZoneOwner(data[zone.id]));
        return zone;
    })
    .map((zone) => {
        zone.number = getZoneNumber(data[zone.id]);
        return zone;
    });
}

module.exports = convertMainMapPlayerZones;
