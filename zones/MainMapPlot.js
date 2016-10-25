const config = require( '../config.json' );

const MainMapZone = require( './MainMapZone' );
const Player = require( '../player/Player' );

/*
 * a plot in one of the plot areas of the mainmap of unlimitedworld
 */
class MainMapPlot extends MainMapZone {
    constructor( id, area, number, x1, x2, z1, z2 ) {
        super( id, x1, x2, z1, z2, 'MainMapPlot' );

        this._number = number;
        this._area = area;

        this._previousOwners = new Set();
    }

    /*
     * adds the player as a owner of the zone
     */
    addOwner(player, fromDate, tillDate) {
        if ( !Player.isPlayer( player ) )
            throw new Error( 'no Player' );

        this._previousOwners.add({
            player: player,
            from: fromDate,
            till: tillDate,
        });
    }

    /*
     * gets the set of the previous owners of the plot in the format {player: UwmcPlayer, from: Date, till: Date}
     */
    get previousOwners() {
        return this._previousOwners;
    }

    /*
     * overwrites the set of previousOwners to the value without checking the format (use addOwner instead)
     */
    _setPreviousOwners(previousOwners) {
        this._previousOwners = previousOwners;
    }

    /*
     * gets the player that ownes the plot (instanceof Player or Boolean if it doesn't have a current owner associated)
     */
    get owner() {
        for(let owner of this.previousOwners) {
            if(!owner.till)
                return owner.player;
        }

        return false;
    }

    /*
     * gets the number of the plot in the area
     */
    get number() {
        return this._number;
    }

    /*
     * gets the area of the plot (eg. Neustadt)
     */
    get area() {
        return this._area;
    }

    /*
     * gets the name of the MainMapPlot like it is viewed on the dynmap (Area Number)
     */
    get name() {
        return `${this.area} ${this.number}`;
    }

    /*
     * returns whether the zone has a owner or not
     */
    get owned() {
        for(let owner of this.previousOwners) {
            if(!owner.till)
                return true;
        }

        return false;
    }

    /*
     * saves the plot to the database if it isn't existing
     * The created time will be set if no element with the zoneid exists in the database
     * an will be set to the current date, the created field of the object is ignored.
     * The deleted time will be unset in the database.
     */
    saveToDb( db ) {
        let zone = this;

        return new Promise( function( resolve, reject ) {
            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.MAINMAP_PLOTS ).insertOne( {
                _id: zone.id,
                x1: zone.pos.x1,
                x2: zone.pos.x2,
                z1: zone.pos.z1,
                z2: zone.pos.z2,
                number: zone.number,
                area: zone.area,
                previousOwners: [...zone.previousOwners],
            },
            function( err, results ) {
                if ( err )
                    reject( err );

                resolve( results );
            } );
        } );
    }

    /*
     * updates the previous owner field of the database
     */
    updateDbOwner(db) {
        if(!this.owned && this.previousOwners.size < 1)
            return Promise.reject();

        let plot = this;

        return new Promise( function( resolve, reject ) {
            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.MAINMAP_PLOTS ).findOne( {
                _id: plot.id,
            }, {
                previousOwners: 1,
                _id: 0,
            },
            function(err, res) {
                if ( err )
                    reject( err );

                let previousOwner = false;


                for(let owner of res.previousOwners) {
                    if(owner.till === null) {
                        previousOwner = owner;
                    }
                }

                if(!plot.owned) {
                    // set the old owners till date to null
                    db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.MAINMAP_PLOTS ).updateOne(
                        {
                            '_id': plot.id,
                            'previousOwners.$.till': null,
                        },
                        {
                            $set: {'previousOwners.$.till': new Date()},
                        },
                        function(err) {
                            if(err)
                                reject(err);

                            resolve(res);
                        }
                    );
                } else if(!previousOwner) {
                    // add the new owner
                    db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.MAINMAP_PLOTS ).updateOne(
                        {
                            '_id': plot.id,
                        },
                        {
                            $push: {
                                'previousOwners': plot.owner.toJson(),
                            },
                        },
                        function(err, res) {
                            if(err)
                                reject(err);

                            resolve(res);
                        }
                    );
                }else if(previousOwner.player.uuid != plot.owner.uuid) {
                    // set the current owners end date to the current date and save the new owner
                    db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.MAINMAP_PLOTS ).updateOne(
                        {
                            '_id': plot.id,
                            'previousOwners.$.till': null,
                        },
                        {
                            $set: {'previousOwners.$.till': new Date()},
                        },
                        function(err) {
                            if(err)
                                reject(err);

                            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.MAINMAP_PLOTS ).updateOne(
                                {
                                    '_id': plot.id,
                                },
                                {
                                    $push: {
                                        'previousOwners': plot.owner.toJson(),
                                    },
                                },
                                function(err, res) {
                                    if(err)
                                        reject(err);

                                    resolve(res);
                                }
                            );
                        }
                    );
                }
            } );
        } );
    }


    /*
     * creates a MainMapPlot from the database
     */
    static fromDb(db, id) {
        return new Promise( function( resolve, reject ) {
            db.collection( config.MONGODB.DATABASE.UWMC.COLLECTION.MAINMAP_PLOTS ).find( {
                _id: id,
            }).each(function(err, res) {
                if ( err ) {
                    reject( err );
                }

                if(res) {
                    resolve(MainMapPlot.fromDbObject(res));
                }
            });
        });
    }

    /*
     * creates a MainMapPlot from the data from the database
     */
    static fromDbObject(obj) {
        let plot = new MainMapPlot(obj._id, obj.area, obj.number, obj.x1, obj.x2, obj.z1, obj.z2);
        if(obj.previousOwners) {
            plot._setPreviousOwners(new Set(obj.previousOwners));
        }

        return plot;
    }
}

module.exports = MainMapPlot;
