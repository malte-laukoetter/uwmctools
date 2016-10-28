const config = require( '../config.json' );

const MainMapZone = require( './MainMapZone' );
const Zone = require( './Zone' );
const Player = require( '../player/Player' );

/**
 * a zone of a player on the mainmap of unlimitedworld
 */
class PlayerZone extends MainMapZone {
    /**
     * creates a new Player Zone
     * @param {Player} player the player that owns the zone
     * @param {int} number the zonenumber of the zone (unique per player)
     * @param {string} id the id of the zone (eg. uwzone_23131)
     * @param {int} x1 the x1 coordinate of the area
     * @param {int} x2 the x2 coordinate of the area
     * @param {int} z1 the z1 coordinate of the area
     * @param {int} z2 the z2 coordinate of the area
     */
    constructor( player, number, id, x1, x2, z1, z2 ) {
        super( id, x1, x2, z1, z2, 'Player' );

        if ( !Player.isPlayer( player ) )
            throw new Error( 'no Player' );

        this._player = player;
        this._number = number;
    }

    /**
     * gets the player that owns the zone (instanceof Player)
     * @return {Player} the owner of the zone
     */
    get player() {
        return this._player;
    }

    /**
     * gets the number of the zone (uniqe per player)
     * @return {int} the zone number
     */
    get number() {
        return this._number;
    }

    /**
     * gets the name of the zone like it is viewed on the dynmap (PlayerName#Number)
     * @return {string} the name of the zone
     */
    get name() {
        return `${this.player.name}#${this.number}`;
    }

    /**
     * saves the zone to the database
     * The created time will be set if no element with the zoneid exists in the database an will be set to the current
     * date, the created field of the object is ignored.
     * The deleted time will be unset in the database.
     * @param {Db} db the database in that the zone should be set to deleted
     * @return {Promise} the result of the database query
     */
    saveToDb( db ) {
        let zone = this;

        return new Promise( function( resolve, reject ) {
            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.ZONES ).updateOne( {
                zoneId: zone.id,
            }, {
                $set: {
                    'x1': zone.pos.x1,
                    'x2': zone.pos.x2,
                    'z1': zone.pos.z1,
                    'z2': zone.pos.z2,
                    'owner.id': zone.player.uuid,
                    'owner.name': zone.player.name,
                    'number': zone.number,
                },
                $unset: {
                    deleted: '',
                },
                $currentDate: {
                    updated: true,
                },
                $setOnInsert: {
                    created: new Date(),
                },
            }, {
                upsert: true,
            },
            function( err, results ) {
                if ( err )
                    reject( err );

                resolve( results );
            } );
        } );
    }

    /**
     * sets the status of the zone to deleted
     * @param {Db} db the database in that the zone should be set to deleted
     */
    setToDeleted(db) {
        let zone = this;

        super.setToDeleted(db, config.MONGODB.DATABASE.UWMC.COLLECTION.ZONES).then(function(res) {
            Zone.eventEmitter.emit('zonedelete', zone);
        });
    }

    /**
     * creates a PlayerZone from the database
     * @param {Db} db the database that should be used
     * @param {string} zoneId the zoneid of the zone that should be created
     * @return {Promise.<PlayerZone, Error>} a promise of the Zone with the given zoneId
     */
    static fromDb(db, zoneId) {
        return new Promise( function( resolve, reject ) {
            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.ZONES ).find( {
                zoneId: zoneId,
            }).each(function(err, res) {
                if ( err ) {
                    reject( err );
                }

                if(res) {
                    resolve(PlayerZone.fromDbObject(res));
                }
            });
        });
    }

    /**
     * true if the value is an instanceof PlayerZone
     * @param {Object} zone the Object that should be tested
     * @return {boolean} true if the object is a PlayerZone
     */
    static isPlayerZone( zone ) {
        return zone instanceof PlayerZone;
    }

    /**
     * creates a PlayerZone from the data from the database
     * @param {Object} obj the data that is returned from the database about a PlayerZone
     * @return {PlayerZone|Boolean} the created PlayerZone or false if the data can't be converted to a PlayerZone
     */
    static fromDbObject(obj) {
        if(!obj.owner)
            return false;

        let player = new Player(obj.owner.id);
        player.name = obj.owner.name;
        let zone = new PlayerZone(player, obj.number, obj.zoneId, obj.x1, obj.x2, obj.z1, obj.z2);
        if(obj.created)
            zone.created = new Date(obj.created);
        if(obj.deleted)
            zone.deleted = new Date(obj.deleted);

        return zone;
    }
}

module.exports = PlayerZone;
