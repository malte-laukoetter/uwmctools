function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');

function createNewFirebasePlot(dataRef, playerRef, plot) {
    dataRef.child('pos').set(plot.pos);
    dataRef.child('posX').set(plot.posX);
    dataRef.child('posZ').set(plot.posZ);
    dataRef.child('created').set(new Date().getTime());
    dataRef.child('trusted').set(plot.trusted.map(player => player.uuid));
    if (plot.owner && plot.owner.uuid) {
        dataRef.child('owner').set(plot.owner.uuid);
        playerRef.child(plot.owner.uuid).child('plots').child('owned').child(plot.id).set(true);
    }
    plot.trusted.forEach(player => {
        if (player.uuid) {
            playerRef.child(player.uuid).child('plots').child('trusted').child(plot.id).set(true);
        }
    });
}

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const db = firebase.database();
    const dataRef = db.ref('uwmctools/plots/data');
    const listRef = db.ref('uwmctools/plots/list');
    const playerRef = db.ref('uwmctools/players/data');

    const uwmcTool = new UwmcTools('');

    const plotListData = yield uwmcTool.getPlotListData();
    listRef.once('value', function (arr) {
        let oldPlotSet = arr ? new Set(arr.val()) : [];

        plotListData.forEach(plot => {
            let plotDataRef = dataRef.child(plot.id);

            if (oldPlotSet.has(plot.id)) {
                plotDataRef.once('value', function (data) {
                    if (!plot.owner || data.val().owner && data.val().owner !== plot.owner.uuid) {
                        if (data.val().owner) {
                            playerRef.child(data.val().owner).child('plots').child('owned').child(plot.id).remove();
                        }

                        if (data.val().trusted) {
                            data.val().trusted.forEach(uuid => {
                                playerRef.child(uuid).child('plots').child('trusted').child(plot.id).remove();
                            });
                        }
                    }

                    if (plot.owner && data.val().owner !== plot.owner.uuid) {
                        createNewFirebasePlot(plotDataRef, playerRef, plot);
                    }
                });

                oldPlotSet.delete(plot.id);
            } else {
                createNewFirebasePlot(plotDataRef, playerRef, plot);
            }
        });

        oldPlotSet.forEach(plotId => {
            let plotDataRef = dataRef.child(plotId);

            plotDataRef.once('value', function (data) {
                playerRef.child(data.val().owner).child('plots').child('owned').child(plotId).remove();
                data.val().trusted.forEach(uuid => {
                    playerRef.child(uuid).child('plots').child('trusted').child(plotId).remove();
                });
                plotDataRef.remove();
            });
        });

        listRef.set(plotListData.map(plot => plot.id));
    });
})();

setTimeout(() => process.exit(), 60000);