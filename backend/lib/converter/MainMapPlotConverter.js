function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const zoneConverter = require('./MainMapZoneConverter');
const MainMapPlot = require('../zones/MainMapPlot');
const Player = require('../player/Player');
const playerConverter = require('./PlayerConverter');

/**
 * generates the name of the owner of a main map plot from the label of a main map plot from the dynmap
 * @param {object} data the data of the dynmap about the plot
 * @return {boolean|string} the name of the owner or false if the plot dosn't have an owner
 */
function getOwner(data) {
    const label = data.label;
    const owner = label.split('font-weight:bold">')[1].split('</span')[0];

    return owner === 'Plot verfügbar' ? false : owner.toLowerCase();
}

/**
 * generates the name of a main map plot from the label of a main map plot from the dynmap
 * @param {object} data the data of the dynmap about the plot
 * @return {string} the name of the plot
 */
function getName(data) {
    return data.label.split('font-size:16px">')[1].split('</p')[0];
}

/**
 * generates the areas the plot is located in
 * @param {object} data the data of the dynmap about the plot
 * @return {string} the name of the area
 */
function getArea(data) {
    return getName(data).split(/ /)[0];
}

/**
 * generates the number of the plot
 * @param {object} data the data of the dynmap about the plot
 * @return {int} the number of the plot
 */
function getNumber(data) {
    return getName(data).split(/ /)[1];
}

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (data, Type = MainMapPlot) {
        const zoneList = zoneConverter(data, Type);
        const playerNames = Object.values(data).map(getOwner);
        const players = yield playerConverter(playerNames);

        return zoneList.map(function (zone) {
            const owner = getOwner(data[zone.id]);

            if (owner) {
                if (players.has(owner)) {
                    zone.addOwner(players.get(owner), new Date(), null);
                } else {
                    zone.addOwner(new Player(), new Date(), null);
                }
            }

            return zone;
        }).map(function (zone) {
            zone.area = getArea(data[zone.id]);
            return zone;
        }).map(function (zone) {
            zone.number = getNumber(data[zone.id]);
            return zone;
        });
    });

    return function (_x) {
        return _ref.apply(this, arguments);
    };
})();