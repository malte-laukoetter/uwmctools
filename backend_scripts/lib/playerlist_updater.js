function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('../../backend/lib/main');

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert('./firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const db = firebase.database();
    const ref = db.ref('uwmctools/players');
    const searchRef = ref.child('search');
    const dataRef = ref.child('data');
    const onlineRef = ref.child('online');

    const uwmcTool = new UwmcTools('');

    const playerListData = yield uwmcTool.getPlayerListData();

    yield onlineRef.once('value').then(function (onlineplayers) {
        const names = new Set(Object.keys(onlineplayers.val()));

        playerListData.forEach(function (player) {
            names.delete(player.name);
        });

        console.log(names);

        names.forEach(function (name) {
            onlineRef.child(name).remove();
        });
    });

    playerListData.forEach(function (player) {
        searchRef.child(player.name).set(player.uuid);
        onlineRef.child(player.name).set(player.uuid);
        let playerDataRef = dataRef.child(player.uuid);
        playerDataRef.child('name').set(player.name);

        playerDataRef.child('rank').once('value', function (data) {
            if (data.val() !== player.rank) {
                playerDataRef.child('rank').set(player.rank);
                playerDataRef.child('rankchanges').child(new Date().getTime()).set(player.rank);
            }
        });
        if (player.boardId) {
            playerDataRef.child('boardId').set(player.boardId);
        }
    });
})();

setTimeout(() => process.exit(), 60000);