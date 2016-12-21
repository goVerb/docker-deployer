
class BaseClient {

  constructor(accessKey = '', secretKey = '', region = 'us-west-2') {

    this._accessKey = accessKey;
    this._secretKey = secretKey;
    this._region = region;
  }


  /**
   * Logs messages
   * @param msg
   */
  logMessage(msg) {
    console.log(msg);
  }

}

module.exports = BaseClient;
