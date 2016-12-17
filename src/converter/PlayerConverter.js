const Player = require('../player/Player');
const uuidLockup = require( '../uuid' );

// TODO support other player types (needs a rewrite of uuid.js)
module.exports = (names, Type=Player) => {
    names = names.map((name) => name.toLowerCase());

    return uuidLockup.getUuids( names );

    /*
    .then((players) => {
        console.log(players);
        return players.forEach((name, uuid) => {
            let player = new Type();
            player.name = name;
            player.uuid = uuid;

            return player;
        });
    });
    */
};
