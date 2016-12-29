const config = require('../config.json');

const Zone = require('./Zone');
const Player = require('../player/Player');
const CreatableZone = require('./CreatableZone');

/**
 * a Plot of the Creative Map of unlimitedworld
 */
class Plot extends CreatableZone {
    /**
     * creates a new Plot of the creative map
     * @param {Player} owner the player that owns the zone
     * @param {int} x1 the x1 coordinate of the plot
     * @param {int} x2 the x2 coordinate of the plot
     * @param {int} z1 the z1 coordinate of the plot
     * @param {int} z2 the z2 coordinate of the plot
     * @param {int} posX the x position of the plot in the creative world
     * @param {int} posZ the z position of the plot in the creative world
     */
    constructor(x1 = 0, x2 = 0, z1 = 0, z2 = 0, posX = 0, posZ = 0) {
        super(x1, x2, z1, z2);

        this._posX = posX;
        this._posZ = posZ;
    }

    /**
     * the id of the plot (something like "ebdf264aabda45708f61f2d7a2bb4758-3/-6")
     * @type {string}
     * @readonly
     */
    get id() {
        return `${ this.posX }|${ this.posZ }`;
    }
    set id(id) {
        this._id = id;
    }

    /**
     * the player that owns the plot
     * @type {Player}
     * @readonly
     */
    get owner() {
        return this._owner;
    }
    set owner(player) {
        this._owner = player;
    }

    /**
     * adds a player to the list of trusted players
     * @param {Player} player the player that should be added
     */
    addTrusted(player) {
        if (!Player.isPlayer(player)) throw new Error('no Player');

        if (!this._trusted) this._trusted = [];

        this._trusted.push(player);
    }

    /**
     * all trusted players of the plot
     * @type {Array.<Player>}
     * @readonly
     */
    get trusted() {
        return this._trusted || [];
    }

    /**
     * the name of the zone like it is viewed on the dynmap (X/Z)
     * @type {string}
     * @readonly
     */
    get name() {
        return `${ this.plotPos.x }/${ this.plotPos.z }`;
    }

    /**
     * the x coordinate of plot position (e.g. 0 for the one in the center or 1 for one of the zone next to it)
     * @type {int}
     */
    get posX() {
        return this._posX;
    }
    set posX(posX) {
        this._posX = posX;
    }

    /**
     * gets the z coordinate of the plot position (e.g. 0 for the one in the center or 1 for one of the zone next to it)
     * @type {int}
     */
    get posZ() {
        return this._posZ;
    }
    set posZ(posZ) {
        this._posZ = posZ;
    }

    /**
     * saves the plot to the database
     * @param {Db} db the database to that the plot should be saved
     * @return {Promise} the result of the database query
     */
    saveToDb(db) {
        let plot = this;
        return new Promise(function (resolve, reject) {
            db.collection(config.MONGODB.DATABASE.UWMC.COLLECTION.PLOTS).updateOne({
                plotId: plot.id
            }, {
                $set: {
                    'x': plot.posX,
                    'z': plot.posZ,
                    'owner.id': plot.owner.uuid,
                    'owner.name': plot.owner.name,
                    'length': plot.length,
                    'width': plot.width,
                    'pos.x1': plot.pos.x1,
                    'pos.x2': plot.pos.x2,
                    'pos.z1': plot.pos.z1,
                    'pos.z2': plot.pos.z2,
                    'trusted': plot.trusted
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
            }, function (err, results) {
                if (err) reject(err);

                resolve(results);
            });
        });
    }

    /**
     * sets the status of the plot to deleted
     * @param {Db} db the database in that the plot should be set to deleted
     * @return {Promise} the result of the database query
     */
    setToDeleted(db) {
        let plot = this;

        return new Promise(function (resolve, reject) {
            db.collection(config.MONGODB.DATABASE.UWMC.COLLECTION.PLOTS).update({
                plotId: plot.id
            }, {
                $currentDate: {
                    deleted: true
                }
            }).then(function (res) {
                Zone.eventEmitter.emit('plotdelete', plot);
                resolve(res);
            }).catch(function (err) {
                reject(err);
            });
        });
    }

    /**
     * creates a Plot from the database
     * @param {Db} db the database that should be used
     * @param {string} plotId the plotid of the plot that should be created
     * @return {Promise.<Plot, Error>} a promise of the Plot with the given plotId
     */
    static fromDb(db, plotId) {
        return new Promise(function (resolve, reject) {
            db.collection(config.MONGODB.DATABASE.UWMC.COLLECTION.PLOTS).find({
                plotId: plotId
            }).each(function (err, res) {
                if (err) {
                    reject(err);
                }
                if (res) {
                    resolve(Plot.fromDbObject(res));
                }
            });
        });
    }

    /**
     * test if it is a Plot
     * @param {Object} plot the Object that should be tested
     * @return {boolean} true if the object is a Plot
     */
    static isPlot(plot) {
        return plot instanceof Plot;
    }

    /**
     * creates a Plot from the data from the database
     * @param {Object} obj the data that is returned from the database about a Plot
     * @return {Plot|Boolean} the created Plot or false if the data can't be converted to a Plot
     */
    static fromDbObject(obj) {
        if (!obj.owner) return false;

        let player = new Player(obj.owner.id);
        player.name = obj.owner.name;
        let plot = new Plot(player, obj.pos.x1, obj.pos.x2, obj.pos.z1, obj.pos.z2, obj.x, obj.z);
        if (obj.created) plot.created = new Date(obj.created);
        if (obj.deleted) plot.deleted = new Date(obj.deleted);

        for (let playerObj of obj.trusted) {
            let trusted = new Player(playerObj.id);
            trusted.name = playerObj.name;

            plot.addTrusted(trusted);
        }

        return plot;
    }
}

module.exports = Plot;