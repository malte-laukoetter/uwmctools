const firebase = require('firebase-admin');
const MongoClient = require( 'mongodb' ).MongoClient;


(async function() {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com',
    });

    const fdb = firebase.database();
    const ref = fdb.ref('uwmctools/players/');
    const dataRef = ref.child('data');
    const searchRef = ref.child('search');

    const db = await MongoClient.connect(''); //TODO: add MongoDb Url

    const data = await db.collection('players').find({uuid: {$ne:null}, name: {$ne:null}},
        {name: 1, uuid: 1, rank: 1, ranks: 1, boardId: 1, votes: 1, _id: 0}).toArray();

    try {
        for (let item of data) {
            let playerRef = dataRef.child(item.uuid);
            if(item.rank <= 80)
                searchRef.child(item.name).set(item.uuid);

            if(item.rank)
                playerRef.child('rank').set(item.rank);

            if(item.name)
                playerRef.child('name').set(item.name);

            if(item.boardId)
                playerRef.child('boardId').set(item.boardId);

            if(item.ranks) {
                for(let rankChange of item.ranks) {
                    playerRef.child('rankchanges').child(rankChange.date.getTime()).set(rankChange.rank);
                }
            }

            for(let year in item.votes) {
                for(let month in item.votes[year]) {
                    playerRef.child('votes').child(`${year}-${parseInt(month) + 1}`).set([
                        item.votes[year][month].v1,
                        item.votes[year][month].v2,
                    ]);
                }
            }
        }
    }catch (err) {
        console.error(err);
    }
})();
