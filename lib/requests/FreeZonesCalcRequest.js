const config = require('../config.json');

const Request = require('./Request');
const playerZoneConverter = require('../converter/MainMapPlayerZoneConverter');
const serverZoneConverter = require('../converter/MainMapServerZoneConverter');

/**
 * request to get the data from the dynmap and calculates all free areas
 */
class FreeZonesCalcRequest extends Request {
    /**
     * creates a new FreeZoneCalcRequest
     */
    constructor() {
        super(config.URLS.UWMC.ZONELIST_MAIN);
    }

    /**
     * executes the request, converts the data and returns an array of all free zones
     * @param {int} length the length of the zones that should be found
     * @param {int} width the width of the zones that should be found
     * @return {Promise.<Array.<Zone>>} all free areas
     */
    execute(length, width) {
        return super.execute().then(function (res) {
            const serverzones = serverZoneConverter(res.body.sets.Serverzonen.areas);
            return playerZoneConverter(res.body.sets.Spielerzonen.areas).then(function (playerzones) {
                let area = [];

                // create an 2d-array with an element of value 1 for each block of the world. With this array we
                // will later calculate the free areas (each free field will still have the value 1 because we are
                // setting the fields there assigned blocks of the world are filled with zones to 0
                for (let i = 0; i < 6000; i++) {
                    area[i] = [];
                    for (let j = 0; j < 8000; j++) {
                        area[i][j] = 1;
                    }
                }

                // set all fields there assigned block is filled with a playerzones to 0
                // we also add 2000 to the x and 4000 to the z coordinates so all values are bigger than -1 and we
                // can assign an array field to them
                for (let zone of playerzones) {
                    for (let i = zone.pos.x1 + 2000; i < zone.pos.x2 + 2000; i++) {
                        for (let j = zone.pos.z1 + 4000; j < zone.pos.z2 + 4000; j++) {
                            area[i][j] = 0;
                        }
                    }
                }

                // do the same thing for all the serverzones
                for (let zone of serverzones) {
                    for (let i = zone.pos.x1 + 2000; i < zone.pos.x2 + 2000; i++) {
                        for (let j = zone.pos.z1 + 4000; j < zone.pos.z2 + 4000; j++) {
                            area[i][j] = 0;
                        }
                    }
                }

                // here we are calculating all free areas that have a equal length and widht with the given values
                let areas = FreeZonesCalcRequest.biggerRectangle(area, length, width);

                return areas.map(area => {
                    return {
                        z1: area.ll.col - 4000,
                        z2: area.ll.col + length - 4000,
                        x1: area.ur.row - 2000,
                        x2: area.ur.row + width - 2000
                    };
                }).filter(area => {
                    return area.x1 <= 2000 || area.z1 <= 2000 && area.z2 > -2000;
                });
            });
        });
    }

    /**
     * modified version of
     * [MaximalRectangle.js]{@link https://gist.github.com/Aurelain/e471c0875a105b80db0e78daf6af4939}
     * by Aurelain, algorithm by Daveed V, this version isn't returning the biggest rectangle but all non overlapping
     * rectangles with at least the given length and width
     *
     * License of this code part: unknown
     *
     * @param {Array.<Array.<int>>} matrix an matrix with a 1 for each free field and a 0 for each occupied field
     * @param {int} length the length that the free rectangles should have
     * @param {int} width the width that the free rectangles should have
     * @return {Array.<Object>} an array of all the free rectangles
     * @property {int} object.area the size of the area
     * @property {int} object.ll.col the col of the upper left corner of the rectangle
     * @property {int} object.ll.row the row of the upper left corner of the rectangle
     * @property {int} object.ur.col the col of the bottom right corner of the rectangle
     * @property {int} object.ur.row the row of the bottom right corner of the rectangle
     */
    static biggerRectangle(matrix, length, width) {
        let m; // iterator for columns
        let n; // iterator for rows
        let M = matrix[0].length; // number of columns;
        let N = matrix.length; // number of rows
        let c = []; // linear cache
        let s = []; // stack of {col, row} pairs

        let areas = [];

        for (m = 0; m != M + 1; ++m) {
            c[m] = 0;
            s[m] = { col: 0, row: 0 };
        }
        for (n = 0; n != N; ++n) {
            for (m = 0; m != M; ++m) {
                c[m] = matrix[n][m] ? c[m] + 1 : 0; // update cache
            }
            let openWidth = 0;
            for (m = 0; m != M + 1; ++m) {
                if (c[m] > openWidth) {
                    /* Open new rectangle? */
                    s.push({ col: m, row: openWidth });
                    openWidth = c[m];
                } else if (c[m] < openWidth) {
                    /* Close rectangle(s)? */
                    let m0;
                    let n0;
                    let area;
                    do {
                        let cell = s.pop();
                        m0 = cell.col;
                        n0 = cell.row;
                        area = openWidth * (m - m0);
                        if (area >= length * width && Math.abs(m0 - (m - 1)) >= length && Math.abs(n - (n - openWidth + 1)) >= width) {
                            let llCol = m0;
                            let llRow = n;
                            let urCol = m - 1;
                            let urRow = n - openWidth + 1;
                            let alreadySaved = false;

                            for (let bigArea of areas) {
                                // is any corner of the new area in another area (so we test if they overlap)
                                if (llCol >= bigArea.ll.col && llCol <= bigArea.ur.col || urCol >= bigArea.ll.col && urCol <= bigArea.ur.col || llRow <= bigArea.ll.row && llRow >= bigArea.ur.row || urRow <= bigArea.ll.row && urRow >= bigArea.ur.row) {
                                    alreadySaved = true;
                                }
                            }

                            if (!alreadySaved) {
                                areas.push({
                                    area: area,
                                    ll: { col: llCol, row: llRow },
                                    ur: { col: urCol, row: urRow }
                                });
                            }
                        }
                        openWidth = n0;
                    } while (c[m] < openWidth);
                    openWidth = c[m];
                    if (openWidth != 0) {
                        s.push({ col: m0, row: n0 });
                    }
                }
            }
        }
        return areas;
    }
}

module.exports = FreeZonesCalcRequest;