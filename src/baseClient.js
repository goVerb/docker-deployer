const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');
const moment = require('moment');

class BaseClient {

  constructor(accessKey = '', secretKey = '', region = 'us-west-2', logLevel='info') {
    if(logLevel === 'mute') {
      logLevel = 70;
    }
    this._logger = this._createLogger(logLevel);
    this._accessKey = accessKey;
    this._secretKey = secretKey;
    this._region = region;
  }


  /**
   * Logs messages to stdout stream
   * @param msg
   */
  logMessage(msg) {
    this._logger.info(`[${moment().format()}] ${msg}`);
  }

  /**
   * Logs error messages to error stream
   * @param msg
   */
  logError(msg) {
    this._logger.error(`[${moment().format()}] ${msg}`);
  }

  /**
   * Logs fatal messages to fatal stream
   * @param msg
   */
  logFatal(msg) {
    this._logger.fatal(`[${moment().format()}] ${msg}`);
  }


    /**
   * Logs warning messages to warning stream
   * @param msg
   */
  logWarning(msg) {
    this._logger.warn(`[${moment().format()}] ${msg}`);
  }

  /**
   * Logs debug messages to debug stream
   * @param msg
   */
  logDebug(msg) {
    this._logger.debug(`[${moment().format()}] ${msg}`);
  }

  _createLogger(logLevel) {
    const loggerOptions = {
      name: 'docker-deployer',
      streams: []
    };
    const prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);  
    loggerOptions.streams.push({
      level: logLevel,
      type: 'raw',
      stream: prettyStdOut
    });

    return bunyan.createLogger(loggerOptions);
  }

}


module.exports = BaseClient;
