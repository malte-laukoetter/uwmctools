/**
 * Data about a Minecraft player
 */
class Player {
    /**
     * creates a new Player
     * @param {string} uuid uuid of the player
     */
    constructor( uuid='' ) {
        this._uuid = uuid;
    }

    /**
     * the uuid of the player
     * @type {string}
     * @readonly
     */
    get uuid() {
        return this._uuid;
    }
    set uuid(name) {
        this._uuid = name;
    }

    /**
     * the name of the player, an empty string if no name is set
     * @type {string}
     */
    get name() {
        return this._name || '';
    }
    set name(name) {
        this._name = name;
    }

    /**
     * test if the player is a Player
     * @param {Object} player the object to test
     * @return {boolean} true if it is a Player
     */
    static isPlayer( player ) {
        return player instanceof Player;
    }

    /**
     * converts the Player to JSON
     * @return {Object} the converted player
     */
    toJson() {
        return {
            'uuid': this.uuid,
            'name': this.name,
        };
    }
}

module.exports = Player;
