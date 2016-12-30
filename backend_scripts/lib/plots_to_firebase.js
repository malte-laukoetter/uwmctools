function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const fdb = firebase.database();
    const playerRef = fdb.ref('uwmctools/players/data');
    const plotsRef = fdb.ref('uwmctools/plots/data');

    const db = yield MongoClient.connect(''); //TODO: add MongoDb Url

    const data = yield db.collection('plots').aggregate([{
        $group: {
            '_id': {
                'x': '$x',
                'z': '$z'
            },
            'x': {
                $last: '$data'
            },
            'z': {
                $last: '$data'
            },
            'owner': {
                $last: '$data'
            },
            'pos': {
                $last: '$data'
            },
            'trusted': {
                $last: '$data'
            },
            'created': {
                $last: '$data'
            }
        }
    }]).toArray();

    try {
        for (let item of data) {
            let plotId = `${ item.x }|${ item.z }`;
            let plotRef = plotsRef.child(plotId);

            if (item.created) plotRef.child('created').set(item.created.getTime());

            if (item.owner) {
                plotRef.child('owner').set(item.owner.id);
                playerRef.child(item.owner.id).child('plots').child('owned').child(plotId).set(true);
            }

            if (item.x) plotRef.child('posX').set(item.x);

            if (item.z) plotRef.child('posZ').set(item.z);

            if (item.pos) plotRef.child('pos').set(item.pos);

            if (item.trusted) {
                plotRef.child('trusted').set(item.trusted.map(function (trusted) {
                    return trusted._uuid;
                }));
                for (let trusted of item.trusted) {
                    playerRef.child(trusted._uuid).child('plots').child('trusted').child(plotId).set(true);
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
})();