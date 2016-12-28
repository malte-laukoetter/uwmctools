const firebase = require('firebase-admin');
const UwmcTools = require('../../backend/lib/main');

(async function() {
    firebase.initializeApp({
        credential: firebase.credential.cert('./firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com',
    });

    const db = firebase.database();
    const ref = db.ref('uwmctools/zones');
    const dataRef = ref.child('data');

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
            }
        });
    });
})();

setTimeout(() => process.exit(), 60000);
