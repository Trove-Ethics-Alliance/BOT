const moment = require('moment');

/**
 * Converts the mongodb date representation to a string using moment.js formatting.
 * @param {String} mongoDate Date object from mongo document
 * @returns returns a formatted data string: 13th May 2023 at 1:00 PM UTC
 */
function convertMongoDateToMoment(mongoDate) {
    return moment.utc(mongoDate).format('Do MMMM YYYY [at] h:mm A z');
}

module.exports = {
    convertMongoDateToMoment
};