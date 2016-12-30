const firebase = require('firebase-admin');

(async function() {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com',
    });

    const fdb = firebase.database();
    const ref = fdb.ref('uwmctools/players/data');
    fdb.ref('uwmctools/plots').remove();

    try {
        ref.once('value', (data) => {
            for (let item of Object.keys(data.val())) {
                ref.child(item).child('plots').remove();
            }
        });
    }catch (err) {
        console.error(err);
    }
})();
