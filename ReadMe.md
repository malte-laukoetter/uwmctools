# unlimitedworld.de tools of Lergin.de

## Usage

``` javascript
const UwmcTools = require('uwtools');

//connection url of the Mongodb databse
const MONGODB_URL = 'mongodb://database/uwtools';

//init the module with the url of the MongoDb database
let uwtool = new UwmcTools(MONGODB_URL);

//save the data from the playerlist
uwtool.savePlayerListData();

//save the data about the plots
uwtool.savePlotListData();

//save the data about the zones
uwtool.saveZoneListData();

//save the data from the zonelist
uwtool.saveVoteListData();

//get the data about a player
uwtool.getPlayer('ebdf264aabda45708f61f2d7a2bb4758').then(function(player){
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
