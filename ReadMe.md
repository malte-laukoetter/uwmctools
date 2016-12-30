# unlimitedworld.de tools of Lergin.de

Documentation available at: https://lergin.github.io/uwmctools/uwmctools/2.7.1/

## Usage

``` javascript
const UwmcTools = require('uwmctools');

// init the module
let uwmctool = new UwmcTools();

// get the data from the playerlist
const playerListData = await uwmctool.getPlayerListData();

// get the data about the plots
const plotListData = await uwmctool.getPlotListData();

// get the data about the zones
const zoneListData = await uwmctool.getZoneListData();

// get the data from the votelist
const voteListData = await uwmctool.getVoteListData();

// get all free zones of an area greater than 100*100 blocks
let length = 100;
let width = 100;

uwmcTool.getFreeZones(length, width).then(function(res){
     console.log(res);
});
```

For more usage you can look into the backend_scripts folder.

## Requirements
* Nodejs 7.0.0

### Node-Modules
* request

