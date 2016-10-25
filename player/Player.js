/*
 * Data about a Minecraft player
 */
class Player {
    constructor( uuid ) {
        this._uuid = uuid;
    }

    /*
     * the uuid of the player
     */
    get uuid() {
        return this._uuid;
    }

    /*
     * sets the name of the player
     */
    set name( name ) {
        this._name = name;
    }

    /*
     * gets the name of the player, returns an empty string if no name is set
     */
    get name() {
        return this._name || '';
    }

    /*
     * true if the value is an instanceof a Player
     */
    static isPlayer( player ) {
        return player instanceof Player;
    }

    /*
     * converts the Player to JSON
     */
    toJson() {
        return {
            'uuid': this.uuid,
            'name': this.name,
        };
    }
}

module.exports = Player;
