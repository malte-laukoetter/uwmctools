function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');
const PushService = require(__dirname + '/pushservice.js');

_asyncToGenerator(function* () {
    try {
        firebase.initializeApp({
            credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
            databaseURL: 'https://dashboard-196e4.firebaseio.com'
        });

        const db = firebase.database();
        const ref = db.ref('uwmctools/players');
        const searchRef = ref.child('search');
        const dataRef = ref.child('data');
        const onlineRef = ref.child('online');

        const uwmcTool = new UwmcTools('');

        const playerListData = yield uwmcTool.getPlayerListData();

        const prevOnlinePlayers = yield onlineRef.once('value').then(function (onlineplayers) {
            if (!onlineplayers.val()) return new Set();

            onlineplayers = onlineplayers.val();

            const names = new Set(Object.keys(onlineplayers));
            const online = new Set(names);

            playerListData.forEach(function (player) {
                names.delete(player.name);
            });

            names.forEach(function (name) {
                PushService.push(`/topics/UWMCTOOLS_PLAYER_OFFLINE_${ onlineplayers[name] }`, {
                    'title': `${ name } ist Offline`,
                    'click_action': `https://uwmc.lergin.de/player/${ name }/overview`,
                    'icon': `https://crafatar.com/avatars/${ onlineplayers[name] }?overlay`
                });
                onlineRef.child(name).remove();
            });

            return online;
        });

        playerListData.forEach(function (player) {
            if (!prevOnlinePlayers.has(player.name)) {
                PushService.push(`/topics/UWMCTOOLS_PLAYER_ONLINE_${ player.uuid }`, {
                    'title': `${ player.name } ist Online`,
                    'click_action': `https://uwmc.lergin.de/player/${ player.name }/overview`,
                    'icon': `https://crafatar.com/avatars/${ player.uuid }?overlay`
                });
            }

            searchRef.child(player.name).set(player.uuid);
            onlineRef.child(player.name).set(player.uuid);
            let playerDataRef = dataRef.child(player.uuid);
            playerDataRef.child('name').set(player.name);

            playerDataRef.child('rank').once('value', function (data) {
                if (data.val() !== player.rank) {
                    playerDataRef.child('rank').set(player.rank);
                    playerDataRef.child('rankchanges').child(new Date().getTime()).set(player.rank);
                    PushService.push(`/topics/UWMCTOOLS_PLAYER_RANKCHANGE_${ player.uuid }`, {
                        'title': `Rangänderung von ${ player.name }`,
                        'body': `${ player.name } ist jetzt ${ rankToName(player.rank) }!`,
                        'click_action': `https://uwmc.lergin.de/player/${ player.name }/overview`,
                        'icon': `https://crafatar.com/avatars/${ player.uuid }?overlay`
                    });
                }
            });
            if (player.boardId) {
                playerDataRef.child('boardId').set(player.boardId);
            }
        });
    } catch (err) {
        console.error(err);
    }
})();

function rankToName(rank) {
    switch (rank) {
        case 10:
            return 'Owner';
        case 20:
            return 'Dev';
        case 30:
            return 'Admin';
        case 40:
            return 'Mod';
        case 45:
            return 'Builder';
        case 50:
            return 'Buddy';
        case 60:
            return 'Guard';
        case 70:
            return 'Trusty';
        case 80:
            return 'Spieler';
        case 90:
            return 'Gast';
        default:
            return 'unknown';
    }
}

setTimeout(() => process.exit(), 60000);