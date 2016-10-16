const config = require('../config.json')

const Zone = require('./Zone');
const Player = require('../player/Player');
const MainMapZone = require( './MainMapZone' );

/*
 * a Plot of the Creative Map of unlimitedworld
 */
class Plot extends MainMapZone {
    constructor( owner, x1, x2, z1, z2, posX, posZ ) {
        super( `${owner.uuid}-${posX}/${posZ}`, x1, x2, z1, z2, 'plot' );

        if ( !Player.isPlayer( owner ) )
            throw new Error( 'no Player' );
        this._owner = owner;
        this._posX = posX;
        this._posZ = posZ;
    }

    /*
     * gets the owner of the plot (is a Player object)
     */
    get owner() {
        return this._owner;
    }

    /*
     * adds a player to the list of trusted players
     */
    addTrusted( player ) {
        if ( !Player.isPlayer( player ) )
            throw new Error( 'no Player' );

        if ( !this._trusted )
            this._trusted = [];

        this._trusted.push( player );
    }

    /*
     * gets an array of all tursted players of the plot
     */
    get trusted() {
        return this._trusted || [];
    }

    /*
     * gets the name of the zone like it is viewed on the dynmap (X/Z)
     */
    get name() {
        return `${this.plotPos.x}/${this.plotPos.z}`;
    }

    /*
     * gets the x coordinate of plot position (e.g. 0 for the one in the center or 1 for one of the zone next to it)
     */
    get posX() {
        return this._posX
    }

    /*
     * gets the z coordinate of the plot position (e.g. 0 for the one in the center or 1 for one of the zone next to it)
     */
    get posZ() {
        return this._posZ
    }

    /*
     * gets an identifier for the zone (builded from the plotPos and owner)
     */
    get id() {
        return `${this.owner.uuid}-${this.posX}/${this.posZ}`
    }

    /*
     * saves the plot to the database
     */
    saveToDb(db) {
        let plot = this;
        return new Promise( function ( resolve, reject ) {
            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.PLOTS ).updateOne( {
                    plotId: plot.id
                }, {
                    $set: {
                        x: plot.posX,
                        z: plot.posZ,
                        'owner.id': plot.owner.uuid,
                        'owner.name': plot.owner.name,
                        length: plot.length,
                        width: plot.width,
                        'pos.x1': plot.pos.x1,
                        'pos.x2': plot.pos.x2,
                        'pos.z1': plot.pos.z1,
                        'pos.z2': plot.pos.z2,
                        trusted: plot.trusted
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
     * sets the status of the zone to deleted
     */
    setToDeleted(db){
        let plot = this;

        return new Promise( function ( resolve, reject ) {
            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.PLOTS ).update( {
                plotId: this.id
            }, {
                $currentDate: {
                    deleted: true
                }
            } ).then( function ( res ) {
                Zone.eventEmitter.emit('plotdelete', plot);
                return res
            } );
        } );
    }

    /*
     * true if the value is an instanceof a Plot
     */
    static isPlot( plot ) {
        return plot instanceof Plot;
    }

    /*
     * creates a PlayerZone from the data from the database
     */
    static fromDbObject(obj){
        if(!obj.owner)
            return false

        let player = new Player(obj.owner.id);
        player.name = obj.owner.name;
        let plot = new Plot(player, obj.pos.x1, obj.pos.x2, obj.pos.z1, obj.pos.z2, obj.x, obj.z);
        if(obj.created)
            plot.created = new Date(obj.created);
        if(obj.deleted)
            plot.deleted = new Date(obj.deleted);

        for(let playerObj of obj.trusted){
            let trusted = new Player(playerObj.id);
            trusted.name = playerObj.name;

            plot.addTrusted(trusted);
        }

        return plot
    }
}

module.exports = Plot;
