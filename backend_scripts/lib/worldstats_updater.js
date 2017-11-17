function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');

_asyncToGenerator(function* () {
    try {
        firebase.initializeApp({
            credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
            databaseURL: 'https://dashboard-196e4.firebaseio.com'
        });

        const db = firebase.database();
        const ref = db.ref('uwmctools/stats/world');
        const timelineRef = ref.child('timeline');
        const currentRef = ref.child('current');
        ref.child('updated').set(new Date().toISOString());

        const uwmcTool = new UwmcTools('');

        const worldStats = yield uwmcTool.getZoneMapStatData();

        for (let area in worldStats) {
            if ({}.hasOwnProperty.call(worldStats, area)) {
                const timelineAreaRef = timelineRef.child(area);
                const currentAreaRef = currentRef.child(area);

                timelineAreaRef.child('playerzoneAmount').child(getDateString(new Date())).set(worldStats[area].playerzones.amount);
                timelineAreaRef.child('playerzoneArea').child(getDateString(new Date())).set(worldStats[area].playerzones.area);
                timelineAreaRef.child('serverzoneArea').child(getDateString(new Date())).set(worldStats[area].serverzones);
                timelineAreaRef.child('area').child(getDateString(new Date())).set(worldStats[area].size);

                currentAreaRef.child('playerzoneAmount').set(worldStats[area].playerzones.amount);
                currentAreaRef.child('playerzoneArea').set(worldStats[area].playerzones.area);
                currentAreaRef.child('serverzoneArea').set(worldStats[area].serverzones);
                currentAreaRef.child('area').set(worldStats[area].size);
            }
        }
    } catch (err) {
        if (err) {
            console.error(err);
        }
    }
})();

/**
 * generates a string of the date
 * @param {Date} date
 * @return {string}
 */
function getDateString(date) {
    return date.toISOString().substring(0, 10);
}

setTimeout(() => process.exit(), 60000);