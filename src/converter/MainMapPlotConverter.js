const zoneConverter = require('./MainMapZoneConverter');
const MainMapPlot = require('../zones/MainMapPlot');
const playerConverter = require('./PlayerConverter');

/**
 * generates the name of the owner of a main map plot from the label of a main map plot from the dynmap
 * @param {object} data the data of the dynmap about the plot
 * @return {boolean|string} the name of the owner or false if the plot dosn't have an owner
 */
function getOwner( data ) {
    const label = data.label;
    const owner = label.split( 'font-weight:bold">' )[1].split('</span')[0];

    return (owner === 'Plot verfügbar') ? false : owner.toLowerCase();
}

/**
 * generates the name of a main map plot from the label of a main map plot from the dynmap
 * @param {object} data the data of the dynmap about the plot
 * @return {string} the name of the plot
 */
function getName( data ) {
    return data.label.split( 'font-size:16px">' )[1].split('</p')[0];
}

function getArea( data ) {
    return getName(data).split(/ /)[0];
}

function getNumber( data ) {
    return getName(data).split(/ /)[1];
}

module.exports = async (data, Type=MainMapPlot) => {
    const zoneList = zoneConverter(data, Type);
    const playerNames = Object.values(data).map(getOwner);
    const players = await playerConverter(playerNames);

    return zoneList.map((zone) => {
        const owner = getOwner(data[zone.id]);

        if (owner && players.has(owner)) {
            zone.addOwner(players.get(owner), new Date(), null);
        }

        return zone;
    }).map((zone) => {
        zone.area = getArea(data[zone.id]);
        return zone;
    }).map((zone) => {
        zone.number = getNumber(data[zone.id]);
        return zone;
    });
};
