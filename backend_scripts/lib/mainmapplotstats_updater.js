function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('../../backend/lib/main');

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert('./firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const db = firebase.database();
    const ref = db.ref('uwmctools/stats/mainmapplots');
    const timelineRef = ref.child('timeline');
    const currentRef = ref.child('current');

    const uwmcTool = new UwmcTools('');

    const data = yield uwmcTool.getMainMapPlotStatData();

    for (const item in data) {
        if ({}.hasOwnProperty.call(data, item)) {
            timelineRef.child(item).child('free').child(getDateString(new Date())).set(data[item].free);
            timelineRef.child(item).child('full').child(getDateString(new Date())).set(data[item].full);
            currentRef.child(item).child('free').set(data[item].free);
            currentRef.child(item).child('full').set(data[item].full);
            currentRef.child(item).child('all').set(data[item].full + data[item].free);
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