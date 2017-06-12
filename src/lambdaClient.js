const AWS = require('aws-sdk');
const BlueBirdPromise = require('bluebird');
const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BlueBirdPromise);

class LambdaClient extends BaseClient {


}

module.exports = CloudWatchClient;
