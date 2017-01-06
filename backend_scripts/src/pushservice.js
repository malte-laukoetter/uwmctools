const config = require(__dirname + '/firebase_cloud_messaging.json');

const request = require('request');

exports.push = function (to, notification) {
    request.post({
        url: `https://fcm.googleapis.com/fcm/send`,
        headers: {
            'Authorization': `key=${config.APIKEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'notification': notification,
            'to': to,
        }),
    });
};

exports.subscriptions = function(token) {
    return new Promise(function(resolve, reject) {
        request.get({
            url: `https://iid.googleapis.com/iid/info/${token}?details=true`,
            headers: {
                'Authorization': `key=${config.APIKEY}`,
                'Content-Type': 'application/json',
            },
        }, function(err, res) {
            if(err) {
                reject(err);
            }else{
                resolve(Object.keys(JSON.parse(res.body).rel.topics));
            }
        });
    });
};
