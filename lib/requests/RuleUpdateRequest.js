let cheerio = require('cheerio');

const config = require('../config.json');
const Request = require('./Request');

/**
 * request to get the current rules of the server
 * the database
 */
class RuleRequest extends Request {
    /**
     * creates a new RuleRequest
     */
    constructor() {
        super(config.URLS.UWMC.RULES);
        this.json = false;
    }

    /**
     * executes the request and extracts the data
     * @return {Promise} the current rules
     */
    execute(db) {
        let req = this;
        try {
            return super.execute().then(function (res) {
                let $ = cheerio.load(res.body);
                console.log($.html());
            });
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = RuleRequest;