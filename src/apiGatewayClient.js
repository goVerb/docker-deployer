const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
const base64 = require('base-64');
let util = require('util');

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

  _getDomainName(restApiId) {
    const region = this._region;
    return `${restApiId}.execute-api.${region}.amazonaws.com`;
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

  lookupApiGatewayDomainName(apiName) {
    return this.lookupApiGatewayByName(apiName).then(api => {
      if(!api) {
        this.logMessage(`No API avaialble for [RestAPI Name ${apiName}]`);
        return null;
      }
      return this._getDomainName(api.id);
    });
  }

  createDeployment(restApiId, stageName, variableCollection) {
    if (util.isNullOrUndefined(stageName) || stageName === "") {
      return BlueBirdPromise.reject("stageName must be populated");
    }

    if (util.isNullOrUndefined(restApiId) || restApiId === "") {
      return BlueBirdPromise.reject("restApiId must be populated");
    }

    if (util.isNullOrUndefined(variableCollection) || variableCollection.length === 0) {
      return BlueBirdPromise.reject("variableCollection must be populated");
    }

    return BlueBirdPromise.resolve().then(() => {

      let createParams = {
        restApiId: restApiId, /* required */
        stageName: stageName, /* required */
        cacheClusterEnabled: false,
        description: '',
        variables: variableCollection
      };

      this.logMessage(`Creating Deployment. [ApiGatewayId: ${restApiId}] [StageName: ${stageName}]`);
      return this._apiGatewayClient.createDeployment(createParams).promise();
    }).then(data => {
      const params = {
        restApiId: restApiId,
        stageName: stageName,
        patchOperations: [
          {
            op: 'replace',
            path: '/*/*/logging/loglevel',
            value: 'INFO'
          },
          {
            op: 'replace',
            path: '/*/*/metrics/enabled',
            value: 'true'
          },
          {
            op: 'replace',
            path: '/*/*/logging/dataTrace',
            value: 'true'
          }]
      };
      this.logMessage(`Updating Stage. [ApiGatewayId: ${restApiId}] [StageName: ${stageName}]`);
      return this._apiGatewayClient.updateStage(params).promise();
    }).then(data => {
      this.logMessage(`Success: ${JSON.stringify(data)}`);
    }).catch(err => {
      this.logMessage(err);
      throw err;
    });
  }

  _deployApiGatewayToStage(apiGatewayId, stageName, stageFullName) {
    if (util.isNullOrUndefined(apiGatewayId)) {
      return BlueBirdPromise.reject("apiGatewayId is null or undefined");
    }

    if (util.isNullOrUndefined(stageName)) {
      return BlueBirdPromise.reject("stageName is null or undefined");
    }

    if (util.isNullOrUndefined(stageFullName)) {
      return BlueBirdPromise.reject("stageFullName is null or undefined");
    }

    this.logMessage(`Deploying to '${stageFullName}' Environment`);

    return BlueBirdPromise.resolve().then(() => {
      let params = {
        restApiId: apiGatewayId, /* required */
        stageName: stageName, /* required */
        cacheClusterEnabled: false,
        description: `${stageFullName} - ${moment.utc().format()}`,
        stageDescription: `${stageFullName} - ${moment.utc().format()}`
      };

      this._apiGatewayClient.createDeployment(params).promise();
    });
  }

  _deployApiGatewayToStageForEnvByGatewayName(environment, apiName, delayInMilliseconds = 16000) {
    let methodName = 'deployApiGatewayToStageForEnvByGatewayName';
    let unknown = "UNK";

    if (util.isNullOrUndefined(environment) ||
      util.isNullOrUndefined(environment.FullName) ||
      environment.FullName.toLocaleUpperCase() === unknown ||
      util.isNullOrUndefined(environment.ShortName) ||
      environment.ShortName.toLocaleUpperCase() === unknown) {

      return BlueBirdPromise.reject({
        plugin: methodName,
        message: `environment is not valid [environment: ${this._getObjectAsString(environment)}]`
      });
    }

    if (util.isNullOrUndefined(apiName) || apiName === '') {
      return BlueBirdPromise.reject({
        plugin: methodName,
        message: 'apiName is null or undefined'
      });
    }

    return this.lookupApiGatewayByName(apiName).delay(delayInMilliseconds).then((foundApiId)=> {
      if (util.isNullOrUndefined(foundApiId)) {
        return BlueBirdPromise.reject({
          plugin: methodName,
          message: "foundApiId is null or undefined (no match found)"
        });
      }

      this.logMessage(`Found the foundApid: ${foundApiId}`);

      return this._deployApiGatewayToStage(
        foundApiId,
        environment.ShortName,
        environment.FullName).delay(delayInMilliseconds).then((data) => {
        this.logMessage(`deployApiGatewayToStageForEnvByGatewayName was a success ${this._getObjectAsString(data)}`);
        return BlueBirdPromise.resolve(data);
      }).catch((error) => {
        return BlueBirdPromise.reject({
          plugin: methodName,
          message: this._getObjectAsString(error)
        });
      });
    }).catch((err)=> {
      return BlueBirdPromise.reject(err);
    });
  };

  _createSwagger(swaggerEntity, failOnWarnings = false) {
    this.logMessage(`createSwagger swagger for [Swagger Title: ${swaggerEntity.info.title}]`);

    var options = {
      body: JSON.stringify(swaggerEntity),
      failOnWarnings: failOnWarnings
    };

    return new BlueBirdPromise((resolve, reject) => {
      this._apiGatewayClient.importRestApi(options).promise()
      .then(data => {
        this.logMessage(`createSwagger swagger for [Swagger Title: ${swaggerEntity.info.title}] completed`);
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
    });
  };

  _overwriteSwagger(apiGatewayId, swaggerEntity, failOnWarnings = false) {
    this.logMessage(`overwriting swagger for [ApiGatewayId: ${apiGatewayId}]`);

    var options = {
      restApiId: apiGatewayId,
      body: JSON.stringify(swaggerEntity),
      failOnWarnings: failOnWarnings,
      mode: "overwrite"
    };

    return new BlueBirdPromise((resolve, reject) => {
      this._apiGatewayClient.putRestApi(options).promise()
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
    });
  };

  createOrOverwriteApiSwagger(swaggerEntity, delayInMilliseconds = 16000, failOnWarnings = false){
    let methodName = 'createOrOverwriteApiSwagger';

    if (util.isNullOrUndefined(swaggerEntity)){
      return BlueBirdPromise.reject({
        plugin: methodName,
        message: `swaggerEntity is null or undefined [swaggerEntity: ${this._getObjectAsString(swaggerEntity)}]`
      });
    }

    if (!swaggerEntity.hasOwnProperty("info") || !swaggerEntity.info.hasOwnProperty("title")){
      return BlueBirdPromise.reject({
        plugin: methodName,
        message: `swaggerEntity must contain info and title [swaggerEntity: ${this._getObjectAsString(swaggerEntity)}]`
      });
    }

    if (util.isNullOrUndefined(swaggerEntity.info.title) || swaggerEntity.info.title === ""){
      return BlueBirdPromise.reject({
        plugin: methodName,
        message: `swaggerEntity.info.title is null, undefined, or empty [swaggerEntity: ${this._getObjectAsString(swaggerEntity)}]`
      });
    }

    return this.lookupApiGatewayByName(swaggerEntity.info.title).then((foundApiId)=> {
      if (util.isNullOrUndefined(foundApiId)) {
        this.logMessage(`${methodName}: creating api gateway`);
        return this._createSwagger(swaggerEntity, failOnWarnings).delay(delayInMilliseconds);
      }

      this.logMessage(`${methodName}: Found the [foundApid: ${foundApiId}]`);

      return this._overwriteSwagger(foundApiId, swaggerEntity, failOnWarnings).delay(delayInMilliseconds).then((data) => {
        this.logMessage(`${methodName} was a success ${this._getObjectAsString(data)}`);
        return BlueBirdPromise.resolve(data);
      }).catch((error) => {
        return BlueBirdPromise.reject({
          plugin: methodName,
          message: this._getObjectAsString(error)
        });
      });
    }).catch((err)=> {
      return BlueBirdPromise.reject(err);
    });
  }


  _getObjectAsString(entity) {
    return util.isNullOrUndefined(entity) ? '' : JSON.stringify(entity)
  }

}

module.exports = APIGatewayClient;
