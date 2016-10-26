class Helper {
    /*
     * converts an array of objects to an Map where the key of each object is equal to the idField of the corresponding
     * object in the array
     */
    static convertToMap( arr, idField ) {
        let obj = new Map();
        let j = 0;

        for ( let i of arr ) {
            j++;
            obj.set(i[idField].toString().toLowerCase(), i);
        }

        return obj;
    }
}

module.exports = Helper;
