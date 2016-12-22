const config = require( '../config.json' );
const Request = require( './Request' );

/**
 * request to get the current rules of the server
 * the database
 */
class RuleRequest extends Request {
    /**
     * creates a new RuleRequest
     */
    constructor() {
        super( config.URLS.UWMC.RULES );
        this.json = false;
    }

    /**
     * executes the request and extracts the data
     * @return {Promise} the current rules
     */
    execute() {
        return super.execute().then(function(res) {
            return res.body;
        });
    }
}

module.exports = RuleRequest;
