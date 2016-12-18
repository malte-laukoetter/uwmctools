function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const zoneConverter = require('./ZoneConverter');
const playerConverter = require('./PlayerConverter');
const Plot = require('../zones/Plot');

/**
 * generates a list of the names of the trusted persons from the label of a plot from the dynmap
 * @param {data} data the data used by the dynmap for the plot
 * @return {Array.<string>} an array of all the names of the players that have trusted rigths on the plot
 */
function getTrusted(data) {
    let trusted = data.desc.split(/Trusted:<\/b> */)[1].split(/<br>/)[0].split(', ').map(name => name.toLowerCase());

    if (trusted[0] == 'keine') trusted = [];

    return trusted;
}

/**
 * generates the name of the plot owner from the label of a plot from the dynmap
 * @param {object} data the data used by the dynmap for the plot
 * @return {string} the name of the owner of the plot
 */
function getOwner(data) {
    return data.desc.split(/Owner:<\/b> /)[1].split(/<br>/)[0].toLowerCase();
}

module.exports = (() => {
    var _ref = _asyncToGenerator(function* (data, Type = Plot) {
        const zoneList = zoneConverter(data, Type);

        const playerNames = [...new Set(Object.values(data).map(function (data) {
            let names = getTrusted(data);
            names.push(getOwner(data));
            return names;
        }).reduce(function (a, b) {
            return a.concat(b);
        }, []))];

        const players = yield playerConverter(playerNames);

        let i = 0;
        for (let id in data) {
            if ({}.hasOwnProperty.call(data, id)) {
                zoneList[i].posX = data[id].label.split(';')[0];
                zoneList[i].posZ = data[id].label.split(';')[1];
                zoneList[i].owner = players.get(getOwner(data[id]));

                for (let trusted of getTrusted(data[id])) {
                    if (players.has(trusted)) {
                        zoneList[i].addTrusted(players.get(trusted));
                    }
                }
            }
            i++;
        }

        return zoneList;
    });

    return function (_x) {
        return _ref.apply(this, arguments);
    };
})();