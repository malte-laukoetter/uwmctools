const firebase = require('firebase-admin');
const MongoClient = require( 'mongodb' ).MongoClient;


(async function() {
    firebase.initializeApp({
        credential: firebase.credential.cert('./firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com',
    });

    const fdb = firebase.database();
    const ref = fdb.ref('uwmctools/stats/world');
    const timelineRef = ref.child('timeline');


    const db = await MongoClient.connect(''); //TODO: add MongoDb Url

    const data = await db.collection('mapstats').aggregate([{
        $group: {
            '_id': {
                $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$date',
                },
            },
            'data': {
                $last: '$data',
            },
        },
    }, {
        $sort: {
            '_id': 1,
        },
    }]).toArray();

    try {
        for (let item in data) {
            for (let area in data[item].data) {
                const timelineAreaRef = timelineRef.child(area);

                timelineAreaRef.child('playerzoneAmount').child(data[item]._id)
                .set(data[item].data[area].playerzones.amount);
                timelineAreaRef.child('playerzoneArea').child(data[item]._id)
                .set(data[item].data[area].playerzones.area);
                timelineAreaRef.child('serverzoneArea').child(data[item]._id)
                .set(data[item].data[area].serverzones);
                timelineAreaRef.child('area').child(data[item]._id).set(data[item].data[area].size);
            }
        }
    }catch (err) {
        console.error(err);
    }
})();
