# unlimitedworld.de tools of Lergin.de

Documentation available at: https://lergin.github.io/uwmctools/uwmctools/2.4.3/

## Usage

``` javascript
const UwmcTools = require('uwmctools');

//connection url of the Mongodb databse
const MONGODB_URL = 'mongodb://database/uwmctools';

//init the module with the url of the MongoDb database
let uwmctool = new UwmcTools(MONGODB_URL);

//save the data from the playerlist
uwmctool.savePlayerListData();

//save the data about the plots
uwmctool.savePlotListData();

//save the data about the zones
uwmctool.saveZoneListData();

//save the data from the zonelist
uwmctool.saveVoteListData();

//get the data about a player
uwmctool.getPlayer('ebdf264aabda45708f61f2d7a2bb4758').then(function(player){
    //the player is an instance of UwmcPlayer
    console.log(`Name: ${player.name}`);
    console.log(`Rank: ${UwmcTools.rankToRankName(player.rank)}`);
    console.log(`Zones: ${player.zones.length}`);

    // output:
    // Name: Malte662
    // Rank: Spieler
    // Zones: 1
})
```

## Requirements
* Nodejs 6.3.0
* Mongodb 3.2

### Node-Modules
* request
* mongodb


## TODO

* WorldStats
