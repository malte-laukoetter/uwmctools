function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const db = firebase.database();
    const dataRef = db.ref('uwmctools/mapplots/data');
    const playerRef = db.ref('uwmctools/players/data');

    const uwmcTool = new UwmcTools('');

    const plotListData = yield uwmcTool.getMainMapPlotData();

    plotListData.forEach(function (plot) {
        let plotDataRef = dataRef.child(plot.id);

        plotDataRef.child('owners').once('value', function (data) {
            let val = data.val();

            if (!val) {
                plotDataRef.child('pos').set(plot.pos);
                plotDataRef.child('number').set(plot.number);
                plotDataRef.child('area').set(plot.area);
                if (plot.owner) {
                    plotDataRef.child('owners').push({
                        uuid: plot.owner.uuid,
                        from: new Date().getTime()
                    });
                    playerRef.child(plot.owner.uuid).child('mapplots').child(plot.id).set(true);
                }
            }
        });

        plotDataRef.child('owners').orderByKey().limitToLast(1).once('child_added', function (data) {
            if (!plot.owner || data.val().uuid !== plot.owner.uuid) {
                if (!data.val().till) {
                    data.ref.child('till').set(new Date().getTime());
                }

                if (plot.owner) {
                    plotDataRef.child('owners').push({
                        uuid: plot.owner.uuid,
                        from: new Date().getTime()
                    });
                    playerRef.child(plot.owner.uuid).child('mapplots').child(plot.id).set(true);
                }
            }
        });
    });
})();

setTimeout(() => process.exit(), 60000);