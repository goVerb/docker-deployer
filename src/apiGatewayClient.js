const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
const base64 = require('base-64');

const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BlueBirdPromise);


class APIGatewayClient extends BaseClient {

  get _apiGatewayClient() {
  
    if(!this._internalAPIGatewayClient) {
      const params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2015-07-09',
        region: this._region
      };
      this._internalAutoScalingClient = new AWS.APIGateway(params);
    }
  
    return this._internalAPIGatewayClient;
  }

}


module.exports = APIGatewayClient;
