/**
 * a Helper Class
 */
class Helper {
    /**
     * converts an array of objects to an Map where the key of each object is equal to the idField of the corresponding
     * object in the array
     * @param {Array.<Object>} arr that should be converted
     * @param {string} idField the field of the object that should be used as key in the created map
     * @return {Map.<Object>} the map created from the data
     */
    static convertToMap(arr, idField) {
        let obj = new Map();
        let j = 0;

        for (let i of arr) {
            j++;
            obj.set(i[idField].toString().toLowerCase(), i);
        }

        return obj;
    }
}

module.exports = Helper;