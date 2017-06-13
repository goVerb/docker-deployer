const moment = require('moment');

class BaseClient {

  constructor(accessKey = '', secretKey = '', region = 'us-west-2') {

    this._accessKey = accessKey;
    this._secretKey = secretKey;
    this._region = region;
  }


  /**
   * Logs messages to stdout stream
   * @param msg
   */
  logMessage(msg) {
    console.log(`[${moment().format()}] ${msg}`);
  }

  /**
   * Logs error messages to error stream
   * @param msg
   */
  logError(msg) {
    console.error(`[${moment().format()}] ${msg}`);
  }

}

module.exports = BaseClient;
