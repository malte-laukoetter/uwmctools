const config = require('../config.json')

const Zone = require('./Zone');
const Player = require('../player/Player');

/*
 * a Plot of the Creative Map of unlimitedworld
 */
class Plot extends Zone {
    constructor( owner, x1, x2, z1, z2, posX, posZ ) {
        super( x1, x2, z1, z2 );

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
                        posx: plot.posX,
                        posz: plot.posZ,
                        owner: plot.owner,
                        x1: plot.pos.x1,
                        x2: plot.pos.x2,
                        z1: plot.pos.z1,
                        z2: plot.pos.z2,
                        trusted: plot.trusted,
                        updated: new Date()
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
     * true if the value is an instanceof a Plot
     */
    static isPlot( plot ) {
        return plot instanceof Plot;
    }

    /*
     * sets all zones to deleted that not been updated in the last 2 hours
     */
    static setOldPlotsToDeleted( db ) {
        return Zone.setOldZonesToDeleted( db, config.MONGODB.DATABASE.UWMC.COLLECTION.PLOTS );
    }
}

module.exports = Plot;
