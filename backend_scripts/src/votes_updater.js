const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');

(async function() {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com',
    });

    const db = firebase.database();
    const ref = db.ref('uwmctools/players');
    const dataRef = ref.child('data');

    const uwmcTool = new UwmcTools('');

    const playerListData = await uwmcTool.getVoteListData();

    playerListData.forEach((player) => {
        let playerVoteDataRef = dataRef.child(player.uuid).child('votes');

        for(let year in player.votes){
            for(let month in player.votes[year]){
                playerVoteDataRef.child(`${year}-${parseInt(month) + 1}`).set([
                    player.votes[year][month].v1,
                    player.votes[year][month].v2,
                ]);
            }
        }
    });
})();

setTimeout(() => process.exit(), 60000);
