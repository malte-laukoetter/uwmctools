const firebase = require('firebase-admin');
const MongoClient = require( 'mongodb' ).MongoClient;


(async function() {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com',
    });

    const fdb = firebase.database();
    const playerRef = fdb.ref('uwmctools/players/data');
    const zonesRef = fdb.ref('uwmctools/zones/data');
    const zonesListRef = fdb.ref('uwmctools/zones/list');
    zonesListRef.remove();

    const db = await MongoClient.connect(''); //TODO: add MongoDb Url

    const data = await db.collection('zones').find(
        {x1: {$ne: null}, x2: {$ne: null}, z1: {$ne: null}, z2: {$ne: null},
            owner: {$ne: null}, number: {$ne: null}, zoneId: {$ne: null}},
        {x1: 1, x2: 1, z1: 1, z2: 1, owner: 1, number: 1, created: 1, deleted: 1, zoneId: 1, _id: 0}).toArray();

    try {
        for (let item of data) {
            let zoneRef = zonesRef.child(item.zoneId);

            if(item.created)
                zoneRef.child('created').set(item.created.getTime());

            if(item.deleted) {
                zoneRef.child('deleted').set(item.deleted.getTime());
            }else{
                zonesListRef.child(item.zoneId).set(true);
            }

            if(item.owner) {
                zoneRef.child('owner').set(item.owner.id);
                playerRef.child(item.owner.id).child('zones').child(item.zoneId).set(true);
            }

            if(item.number)
                zoneRef.child('number').set(item.number);

            if(item.x1)
                zoneRef.child('pos').child('x1').set(item.x1);

            if(item.x2)
                zoneRef.child('pos').child('x2').set(item.x2);

            if(item.z1)
                zoneRef.child('pos').child('z1').set(item.z1);

            if(item.z2)
                zoneRef.child('pos').child('z2').set(item.z2);
        }
    }catch (err) {
        console.error(err);
    }
})();
