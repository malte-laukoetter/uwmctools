const requestjs = require('request');

/**
 * a request.js request that uses Promises and uses json by default
 */
class Request {
    /**
     * creates a new Request
     * @param {string} url the url of the request
     */
    constructor(url) {
        this._url = url;
        this._json = true;
    }

    /**
     * the url that can be requested
     * @type {string}
     */
    get url() {
        return this._url;
    }

    /**
     * if the response of the request should be parsed as json
     * @type {boolean}
     */
    get json() {
        return this._json;
    }
    set json(isJson) {
        this._json = isJson;
    }

    /**
     * the options object of the request
     * @type {object}
     * @property {string} url
     * @property {boolean} json
     */
    get options() {
        return {
            url: this.url,
            json: this.json
        };
    }

    /**
     * executes the request
     * @return {Promise} the response of the request
     */
    execute() {
        const req = this;

        return new Promise(function (resolve, reject) {
            requestjs(req.options, function (err, res) {
                if (err) reject(err);

                resolve(res);
            });
        });
    }
}

module.exports = Request;