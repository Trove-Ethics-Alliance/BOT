/* eslint-disable no-empty-function */
/* eslint-disable no-console */
const moment = require('moment');
const format = 'DD/MM/YYYY - hh:mm:ss A [UTC]';

const log = {
    log: function (...args) { console.log(`[${moment().utc().format(format)}] [LOG]`, ...args); },
    info: function (...args) { console.info(`[${moment().utc().format(format)}] [INFO]`, ...args); },
    debug: process.env.BOT_DEBUG === 'true' ? function (...args) { console.debug(`[${moment().utc().format(format)}] ⭕ [DEBUG]`, ...args); } : () => { },
    warn: function (...args) { console.warn(`[${moment().utc().format(format)}] [WARN]`, ...args); },
    bug: function (...args) { console.error(`[${moment().utc().format(format)}] 🐛 [BUG]`, ...args); },
};

module.exports = log;