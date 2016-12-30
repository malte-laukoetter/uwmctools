function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const firebase = require('firebase-admin');
const UwmcTools = require('uwmctools');
const PushService = require(__dirname + '/pushservice.js');

_asyncToGenerator(function* () {
    firebase.initializeApp({
        credential: firebase.credential.cert(__dirname + '/firebase_credentials.json'),
        databaseURL: 'https://dashboard-196e4.firebaseio.com'
    });

    const db = firebase.database();
    const ref = db.ref('uwmctools/rules');

    const uwmcTool = new UwmcTools('');

    const data = yield uwmcTool.getRuleData();

    const oldRules = yield ref.once('value');

    if (oldRules.val() !== data) {
        ref.set(data);
        PushService.push('/topics/UWMC_RULE_UPDATE', {
            'title': 'Regeländerung UWMC',
            'body': 'Es gab eine Änderung der Regeln von UnlimitedWorld.de',
            'click_action': 'https://uwmc.de/rules'
        });
    }
})();

setTimeout(() => process.exit(), 60000);