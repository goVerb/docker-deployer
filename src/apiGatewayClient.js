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

  async lookupApiGatewayByName(name) {
    const params = {};
    const data = await this._apiGatewayClient.getRestApis(params).promise();

    return data.items.find(api => api.name === name);
  }

  async lookupStageByStageName(restApiId, stageName) {
    const params = {
      restApiId,
      stageName
    };
    return await this._apiGatewayClient.getStage(params).promise();
  }

  async lookupApiGatewayURL(apiName, stageName) {
    let restApiId;
    const api = await this.lookupApiGatewayByName(apiName);

    if(!api) {
      this.logMessage(`No API avaialble for [RestAPI Name ${apiName}]`);
      return null;
    }

    restApiId = api.id;
    // We are only looking up the StageName to make sure it exists
    const stage= await this.lookupStageByStageName(restApiId, stageName);

    if(!stage) {
      this.logMessage(`No Stage avaialble for [RestAPI Id ${restApiId}][StageName: ${stageName}]`);
      return null;
    }

    return this._getInvokeUrl(restApiId, stageName);
  }

  async lookupApiGatewayDomainName(apiName) {
    const api = await this.lookupApiGatewayByName(apiName);

    if(!api) {
      this.logMessage(`No API avaialble for [RestAPI Name ${apiName}]`);
      return null;
    }

    this.logMessage(`API available: [API ID: ${api.id}]`);
    return this._getDomainName(api.id);
  }

  async createDeployment(restApiId, stageName, variableCollection) {

    try {
      if (util.isNullOrUndefined(stageName) || stageName === "") {
        throw new Error("stageName must be populated");
      }

      if (util.isNullOrUndefined(restApiId) || restApiId === "") {
        throw new Error("restApiId must be populated");
      }

      if (util.isNullOrUndefined(variableCollection) || variableCollection.length === 0) {
        throw new Error("variableCollection must be populated");
      }


        let createParams = {
          restApiId: restApiId, /* required */
          stageName: stageName, /* required */
          cacheClusterEnabled: false,
          description: '',
          variables: variableCollection
        };

        this.logMessage(`Creating Deployment. [ApiGatewayId: ${restApiId}] [StageName: ${stageName}]`);
        await this._apiGatewayClient.createDeployment(createParams).promise();
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
        const data = await this._apiGatewayClient.updateStage(params).promise();
        this.logMessage(`Success: ${JSON.stringify(data)}`);

    } catch (err) {
      this.logMessage(err);
      throw err;
    }
  }

  async _deployApiGatewayToStage(apiGatewayId, stageName, stageFullName) {

    try {
      if (util.isNullOrUndefined(apiGatewayId)) {
        throw new Error("apiGatewayId is null or undefined");
      }

      if (util.isNullOrUndefined(stageName)) {
        throw new Error("stageName is null or undefined");
      }

      if (util.isNullOrUndefined(stageFullName)) {
        throw new Error("stageFullName is null or undefined");
      }

      this.logMessage(`Deploying to '${stageFullName}' Environment`);

      let params = {
        restApiId: apiGatewayId, /* required */
        stageName: stageName, /* required */
        cacheClusterEnabled: false,
        description: `${stageFullName} - ${moment.utc().format()}`,
        stageDescription: `${stageFullName} - ${moment.utc().format()}`
      };

      return await this._apiGatewayClient.createDeployment(params).promise();
    } catch (err) {
      this.logMessage(err);
      throw err;
    }
  }

  async _deployApiGatewayToStageForEnvByGatewayName(environment, apiName, delayInMilliseconds = 16000) {

    try {
      let methodName = 'deployApiGatewayToStageForEnvByGatewayName';
      let unknown = "UNK";

      if (util.isNullOrUndefined(environment) ||
        util.isNullOrUndefined(environment.FullName) ||
        environment.FullName.toLocaleUpperCase() === unknown ||
        util.isNullOrUndefined(environment.ShortName) ||
        environment.ShortName.toLocaleUpperCase() === unknown) {

        throw new Error(`environment is not valid [environment: ${this._getObjectAsString(environment)}]`);
      }

      if (util.isNullOrUndefined(apiName) || apiName === '') {
        throw new Error('apiName is null or undefined')
      }

      const foundApiId = await this.lookupApiGatewayByName(apiName).delay(delayInMilliseconds);

      if (util.isNullOrUndefined(foundApiId)) {
        return BlueBirdPromise.reject({
          plugin: methodName,
          message: "foundApiId is null or undefined (no match found)"
        });
      }

      this.logMessage(`Found the foundApid: ${foundApiId}`);

      const data = await this._deployApiGatewayToStage(foundApiId, environment.ShortName, environment.FullName).delay(delayInMilliseconds);
      this.logMessage(`deployApiGatewayToStageForEnvByGatewayName was a success ${this._getObjectAsString(data)}`);
      return data;
    } catch (err) {
      this.logMessage(err);
      throw err;

    }
  }

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
  }

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
  }

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

    return this.lookupApiGatewayByName(swaggerEntity.info.title).then((foundApi)=> {
      if (util.isNullOrUndefined(foundApi)) {
        this.logMessage(`${methodName}: creating api gateway`);
        return this._createSwagger(swaggerEntity, failOnWarnings).delay(delayInMilliseconds);
      }

      this.logMessage(`${methodName}: Found the [foundApid: ${JSON.stringify(foundApi.id)}]`);

      return this._overwriteSwagger(foundApi.id, swaggerEntity, failOnWarnings).delay(delayInMilliseconds).then((data) => {
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
    return util.isNullOrUndefined(entity) ? '' : JSON.stringify(entity);
  }

}

module.exports = APIGatewayClient;
