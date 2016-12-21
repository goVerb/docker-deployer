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
      this._internalAPIGatewayClient = new AWS.APIGateway(params);
    }
  
    return this._internalAPIGatewayClient;
  }
  
  _getInvokeUrl(restApiId, stageName) {
    const region = this._region;
    return `https://${restApiId}.execute-api.${region}.amazonaws.com/${stageName}`;
  }
  
  lookupApiGatewayByName(name) {
    const params = {};
    return this._apiGatewayClient.getRestApis(params).promise().then(data => {
      return data.items.find(api => api.name === name);
    });
  }
  
  lookupStageByStageName(restApiId, stageName) {
    const params = {
      restApiId,
      stageName
    };
    return this._apiGatewayClient.getStage(params).promise();
  }
  
  lookupApiGatewayURL(apiName, stageName) {
    let restApiId;
    return this.lookupApiGatewayByName(apiName).then(api => {
      if(!api) {
        this.logMessage(`No API avaialble for [RestAPI Name ${apiName}]`);
        return null;
      }
      restApiId = api.id;
      // We are only looking up the StageName to make sure it exists
      return this.lookupStageByStageName(restApiId, stageName);
    }).then(stage => {
      if(!stage) {
        this.logMessage(`No Stage avaialble for [RestAPI Id ${restApiId}][StageName: ${stageName}]`);
        return null;
      }
      return this._getInvokeUrl(restApiId, stageName);
    });
  }

}

module.exports = APIGatewayClient;
