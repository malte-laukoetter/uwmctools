const config = require( '../config.json' );

const Request = require( './Request' );
const ZoneListRequest = require( './ZoneListRequest' );

/*
 * request to get the data from the dynmap and calculates all free 100*100 zones
 */
class FreeZonesCalcRequest extends Request {
    constructor() {
        super( config.URLS.UWMC.ZONELIST_MAIN )
    }

    /*
     * executes the request, converts the data and returns an array of all free zones
     */
    execute(length, width) {
        let req = this;

        return super.execute().then( function ( res ) {
            return ZoneListRequest._convertServerZones(res.body.sets.Serverzonen.areas).then(function(serverzones){
                return ZoneListRequest._convertPlayerZones(res.body.sets.Spielerzonen.areas).then(function(playerzones){
                    let area = [];

                    for(let i = 0; i < 4000; i++){
                        area[i] = []
                        for (let j = 0; j < 8000; j++) {
                            area[i][j] = 1
                        }
                    }

                    for(let zone of playerzones){
                        for(let i = (zone.pos.x1 + 2000); i < (zone.pos.x2 + 2000); i++){
                            for (let j = (zone.pos.z1 + 4000); j < (zone.pos.z2 + 4000); j++) {
                                area[i][j] = 0
                            }
                        }
                    }

                    for(let zone of serverzones){
                        for(let i = (zone.pos.x1 + 2000); i < (zone.pos.x2 + 2000); i++){
                            for (let j = (zone.pos.z1 + 4000); j < (zone.pos.z2 + 4000); j++) {
                                area[i][j] = 0
                            }
                        }
                    }

                    let areas = FreeZonesCalcRequest.biggerRectangle( area, length, width);
                    let niceFormatedAreas = [];

                    for(let area of areas){
                        niceFormatedAreas.push({
                                z1: area.ll.col-4000,
                                z2: (area.ll.col + length)-4000,
                                x1: area.ur.row-2000,
                                x2: (area.ur.row + width)-2000
                        });
                    }

                    return niceFormatedAreas
                });
            });
        });
    }

    /*
     * modified version of https://gist.github.com/Aurelain/e471c0875a105b80db0e78daf6af4939 by Aurelain, algorith by Daveed V
     * this version isn't returning the biggest revtangle but all non overlaping revtangles with at least the given length and width
     *
     * License of this code part: unknown
     */
    static biggerRectangle(matrix, length, width) {
       var m; // iterator for columns
       var n; // iterator for rows
       var M = matrix[0].length; // number of columns;
       var N = matrix.length; // number of rows
       var c = []; // linear cache
       var s = []; // stack of {col, row} pairs

       let areas = [];

       for (m = 0; m != M + 1; ++m) {
           c[m] = 0;
           s[m] = {col: 0, row: 0};
       }
       for (n = 0; n != N; ++n) {
           for (m = 0; m != M; ++m) {
               c[m] = matrix[n][m] ? (c[m] + 1) : 0; // update cache
           }
           var open_width = 0;
           for (m = 0; m != M + 1; ++m) {
               if (c[m] > open_width) { /* Open new rectangle? */
                   s.push({col: m, row: open_width});
                   open_width = c[m];
               } else if (c[m] < open_width) { /* Close rectangle(s)? */
                   var m0;
                   var n0;
                   var area;
                   do {
                       var cell = s.pop();
                       m0 = cell.col;
                       n0 = cell.row;
                       area = open_width * (m - m0);
                       if (area >= length * width && Math.abs(m0 - (m - 1)) >= length && Math.abs(n - (n - open_width + 1) >= width)) {
                           let ll_col = m0;
                           let ll_row = n;
                           let ur_col = m - 1;
                           let ur_row = n - open_width + 1;
                           let alreadySaved = false

                           for(let big_area of areas){
                               //is any corner of the new area in another area (so we test if they overlap)
                               if((ll_col >= big_area.ll.col && ll_col <= big_area.ur.col) ||
                                   (ur_col >= big_area.ll.col && ur_col <= big_area.ur.col) ||
                                   (ll_row <= big_area.ll.row && ll_row >= big_area.ur.row) ||
                                   (ur_row <= big_area.ll.row && ur_row >= big_area.ur.row)){
                                   alreadySaved = true;
                               }
                           }

                           if(!alreadySaved){
                               areas.push({
                                   area: area,
                                   ll: {col: ll_col, row: ll_row},
                                   ur: {col: ur_col, row: ur_row}
                               })
                           }
                       }
                       open_width = n0;
                   } while (c[m] < open_width);
                   open_width = c[m];
                   if (open_width != 0) {
                       s.push({col: m0, row: n0});
                   }
               }
           }
       }
       return areas
   }
}

module.exports = FreeZonesCalcRequest;
