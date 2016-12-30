function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const db = firebase.database();
    const ref = db.ref('uwmctools/players');
    const dataRef = ref.child('data');

    const uwmcTool = new UwmcTools('');

    const playerListData = yield uwmcTool.getVoteListData();

    playerListData.forEach(function (player) {
        let playerVoteDataRef = dataRef.child(player.uuid).child('votes');

        for (let year in player.votes) {
            for (let month in player.votes[year]) {
                playerVoteDataRef.child(`${ year }-${ parseInt(month) + 1 }`).set([player.votes[year][month].v1, player.votes[year][month].v2]);
            }
        }
    });
})();

setTimeout(() => process.exit(), 60000);