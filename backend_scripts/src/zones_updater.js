const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');

(async function() {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com',
    });

    const db = firebase.database();
    const dataRef = db.ref('uwmctools/zones/data');
    const playerRef = db.ref('uwmctools/players/data');

    dataRef.remove();

    const uwmcTool = new UwmcTools('');

    const zoneListData = await uwmcTool.getZoneListData();

    zoneListData.forEach((zone) => {
        let zoneDataRef = dataRef.child(zone.id);

        zoneDataRef.child('created').once('value', function(data) {
            if(!data.val()) {
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
