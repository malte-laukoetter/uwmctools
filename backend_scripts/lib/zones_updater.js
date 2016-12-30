function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const db = firebase.database();
    const dataRef = db.ref('uwmctools/zones/data');
    const listRef = db.ref('uwmctools/zones/list');
    const playerRef = db.ref('uwmctools/players/data');

    const uwmcTool = new UwmcTools('');
    const zoneListData = yield uwmcTool.getZoneListData();
    listRef.once('value', function (arr) {
        let oldZoneSet = arr.val() ? new Set(Object.keys(arr.val())) : new Set();

        zoneListData.forEach(zone => {
            let zoneDataRef = dataRef.child(zone.id);
            if (!oldZoneSet.has(zone.id)) {
                zoneDataRef.child('pos').set(zone.pos);
                zoneDataRef.child('number').set(zone.number);
                zoneDataRef.child('created').set(new Date().getTime());
                zoneDataRef.child('owner').set(zone.player.uuid);
                playerRef.child(zone.player.uuid).child('zones').child(zone.id).set(true);
            } else {
                oldZoneSet.delete(zone.id);
            }
        });

        oldZoneSet.forEach(zoneId => {
            let zoneDataRef = dataRef.child(zoneId);

            zoneDataRef.child('deleted').set(new Date().getTime());
        });

        listRef.set(zoneListData.map(zone => zone.id));
    });
})();

setTimeout(() => process.exit(), 60000);