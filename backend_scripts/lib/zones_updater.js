function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('../../backend/lib/main');

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert('./firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const db = firebase.database();
    const dataRef = db.ref('uwmctools/zones/data');
    const playerRef = db.ref('uwmctools/players/data');

    dataRef.remove();

    const uwmcTool = new UwmcTools('');

    const zoneListData = yield uwmcTool.getZoneListData();

    zoneListData.forEach(function (zone) {
        let zoneDataRef = dataRef.child(zone.id);

        zoneDataRef.child('created').once('value', function (data) {
            if (!data.val()) {
                zoneDataRef.child('pos').set(zone.pos);
                zoneDataRef.child('number').set(zone.number);
                zoneDataRef.child('created').set(new Date().getTime());
                zoneDataRef.child('owner').set(zone.player.uuid);
                playerRef.child(zone.player.uuid).child('zones').child(zone.id).set(true);
            }
        });
    });
})();

setTimeout(() => process.exit(), 60000);