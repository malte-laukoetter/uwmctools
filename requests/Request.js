const requestjs = require('request')

/*
 * a request.js request that uses Prmises and uses json by default
 */
class Request{
    constructor(url){
        this._url = url
        this._json = true
    }

    /*
     * get the url that can be requested
     */
    get url(){
        return this._url;
    }

    /*
     * sets if the response of the request should be parsed as json
     */
    set json(isJson){
        this._json = isJson;
    }

    /*
     * gets the current json setting
     */
    get json(){
        return this._json
    }

    /*
     * gets the options object of the request
     */
    get options(){
        return {
            url: this.url,
            json: this.json
        }
    }

    /*
     * executes the request and returns a Promise with the response of the request
     */
    execute(){
        const req = this;

        return new Promise(function(resolve, reject){
            requestjs(req.options, function(err, res){
                if(err)
                    reject(err);

                resolve(res)
            })
        })
    }
}

module.exports = Request;
