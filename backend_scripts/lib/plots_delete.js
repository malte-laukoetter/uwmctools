function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const fdb = firebase.database();
    const ref = fdb.ref('uwmctools/players/data');
    fdb.ref('uwmctools/plots').remove();

    try {
        ref.once('value', function (data) {
            for (let item of Object.keys(data.val())) {
                ref.child(item).child('plots').remove();
            }
        });
    } catch (err) {
        console.error(err);
    }
})();