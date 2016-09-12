const config = require( '../config.json' );

const MainMapZone = require( './MainMapZone' );
const Zone = require( './Zone' );
const Player = require( '../player/Player' );

/*
 * a zone of a player on the mainmap of unlimitedworld
 */
class PlayerZone extends MainMapZone {
    constructor( player, number, id, x1, x2, z1, z2 ) {
        super( id, x1, x2, z1, z2, 'Player' )

        if ( !Player.isPlayer( player ) )
            throw new Error( 'no Player' )

        this._player = player
        this._number = number
    }

    /*
     * gets the player that ownes the zone (instanceof Player)
     */
    get player() {
        return this._player
    }

    /*
     * gets the number of the zone (uniqe per player)
     */
    get number() {
        return this._number
    }

    /*
     * gets the name of the zone like it is viewed on the dynmap (PlayerName#Number)
     */
    get name() {
        return `${this.player.name}#${this.number}`;
    }

    /*
     * saves the zone to the database
     * The created time will be set if no element with the zoneid exists in the database an will be set to the current date, the created field of the object is ignored.
     * The deleted time will be unset in the database.
     */
    saveToDb( db ) {
        let zone = this;

        return new Promise( function ( resolve, reject ) {
            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.ZONES ).updateOne( {
                    zoneId: zone.id
                }, {
                    $set: {
                        x1: zone.pos.x1,
                        x2: zone.pos.x2,
                        z1: zone.pos.z1,
                        z2: zone.pos.z2,
                        'owner.id': zone.player.id,
                        'owner.name': zone.player.name,
                        number: zone.number
                    },
                    $unset: {
                        deleted: ''
                    },
                    $currentDate: {
                        updated: true
                    },
                    $setOnInsert: {
                        created: new Date()
                    }
                }, {
                    upsert: true
                },
                function ( err, results ) {
                    if ( err )
                        reject( err );

                    resolve( results );
                } );
        } );
    }

    /*
     * true if the value is an instanceof PlayerZone
     */
    static isPlayerZone( zone ) {
        return zone instanceof PlayerZone;
    }

    /*
     * creates a PlayerZone from the data from the database
     */
    static fromDbObject(obj){
        if(!obj.owner)
            return false

        let player = new Player(obj.owner.id);
        player.name = obj.owner.name;
        let zone = new PlayerZone(player, obj.number, obj.zoneId, obj.x[0], obj.x[1], obj.z[0], obj.z[1]);
        if(obj.created)
            zone.created = new Date(obj.created);
        if(obj.deleted)
            zone.deleted = new Date(obj.deleted);

        return zone
    }

    /*
     * sets all zones to deleted that not been updated in the last 2 hours
     */
    static setOldZonesToDeleted( db ) {
        return Zone.setOldZonesToDeleted( db, config.MONGODB.DATABASE.UWMC.COLLECTION.ZONES ).then(function(res){
            for(let zone of res){
                zone = PlayerZone.fromDbObject(zone)
                if(zone)
                    Zone.eventEmitter.emit('zonedelete', zone);
            }
        });
    }
}

module.exports = PlayerZone;
