const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');

(async function() {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com',
    });

    const db = firebase.database();
    const dataRef = db.ref('uwmctools/mapplots/data');
    const playerRef = db.ref('uwmctools/players/data');

    const uwmcTool = new UwmcTools('');

    const plotListData = await uwmcTool.getMainMapPlotData();

    plotListData.forEach((plot) => {
        let plotDataRef = dataRef.child(plot.id);

        plotDataRef.child('owners').once('value', function(data) {
            let val = data.val();

            if(!val) {
                plotDataRef.child('pos').set(plot.pos);
                plotDataRef.child('number').set(plot.number);
                plotDataRef.child('area').set(plot.area);
                if(plot.owner) {
                    plotDataRef.child('owners').push({
                        uuid: plot.owner.uuid,
                        from: new Date().getTime(),
                    });
                    playerRef.child(plot.owner.uuid).child('mapplots').child(plot.id).set(true);
                }
            }
        });

        plotDataRef.child('owners').orderByKey().limitToLast(1).once('child_added', function(data) {
            if(!plot.owner || data.val().uuid !== plot.owner.uuid) {
                if(!data.val().till) {
                    data.ref.child('till').set(new Date().getTime());
                }

                if(plot.owner) {
                    plotDataRef.child('owners').push({
                        uuid: plot.owner.uuid,
                        from: new Date().getTime(),
                    });
                    playerRef.child(plot.owner.uuid).child('mapplots').child(plot.id).set(true);
                }
            }
        });
    });
})();

setTimeout(() => process.exit(), 60000);
