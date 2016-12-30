const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');

(async function() {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com',
    });

    const db = firebase.database();
    const ref = db.ref('uwmctools/players');
    const searchRef = ref.child('search');
    const dataRef = ref.child('data');
    const onlineRef = ref.child('online');

    const uwmcTool = new UwmcTools('');

    const playerListData = await uwmcTool.getPlayerListData();

    await onlineRef.once('value').then((onlineplayers) => {
        const names = new Set(Object.keys(onlineplayers.val()));

        playerListData.forEach((player) => {
            names.delete(player.name);
        });

        console.log(names);

        names.forEach((name) => {
            onlineRef.child(name).remove();
        });
    });

    playerListData.forEach((player) => {
        searchRef.child(player.name).set(player.uuid);
        onlineRef.child(player.name).set(player.uuid);
        let playerDataRef = dataRef.child(player.uuid);
        playerDataRef.child('name').set(player.name);

        playerDataRef.child('rank').once('value', function(data) {
            if(data.val() !== player.rank) {
                playerDataRef.child('rank').set(player.rank);
                playerDataRef.child('rankchanges').child(new Date().getTime()).set(player.rank);
            }
        });
        if(player.boardId) {
            playerDataRef.child('boardId').set(player.boardId);
        }
    });
})();

setTimeout(() => process.exit(), 60000);
