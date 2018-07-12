const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
let util = require('util');
const __ = require('lodash');

const BaseClient = require('./baseClient');


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

  /**
   *
   * @param {string} restApiId
   * @param {string} stageName
   * @return {string}
   * @private
   */
  _getInvokeUrl(restApiId, stageName) {
    const region = this._region;
    return `https://${restApiId}.execute-api.${region}.amazonaws.com/${stageName}`;
  }

  /**
   *
   * @param {string} restApiId
   * @return {string}
   * @private
   */
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

  /**
   *
   * @param {string} apiName
   * @param {string} stageName
   * @return {Promise<*>}
   */
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
  
  /**
   *
   * @param restApiId
   * @param stageName
   * @param variableCollection
   * @param loggingParams
   * @returns {Promise<void>}
   */
  async createDeployment(restApiId, stageName, variableCollection, loggingParams={}) {

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
            value: loggingParams.logLevel || 'INFO'
          },
          {
            op: 'replace',
            path: '/*/*/metrics/enabled',
            value: loggingParams.metricsOn || 'true'
          },
          {
            op: 'replace',
            path: '/*/*/logging/dataTrace',
            value: loggingParams.dataTraceOn || 'true'
          }]
      };
      this.logMessage(`Params for deploy [Params: ${JSON.stringify(params.patchOperations)}]`);
      this.logMessage(`Updating Stage. [ApiGatewayId: ${restApiId}] [StageName: ${stageName}]`);
      const data = await this._apiGatewayClient.updateStage(params).promise();
      this.logMessage(`Success: ${JSON.stringify(data)}`);

    } catch (err) {
      this.logMessage(err);
      throw err;
    }
  }

  /**
   *
   * @param {string} apiGatewayId
   * @param {string} stageName
   * @param {string} stageFullName
   * @return {Promise<PromiseResult<D, E>>}
   * @private
   */
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

  /**
   *
   * @param {Object} environment
   * @param {string} apiName
   * @param {number} [delayInMilliseconds=16000]
   * @return {Promise<PromiseResult<D, E>>}
   * @private
   */
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
        throw new Error('apiName is null or undefined');
      }

      const foundApiId = await this.lookupApiGatewayByName(apiName);
      await BlueBirdPromise.delay(delayInMilliseconds);

      if (util.isNullOrUndefined(foundApiId)) {
        return BlueBirdPromise.reject({
          plugin: methodName,
          message: "foundApiId is null or undefined (no match found)"
        });
      }

      this.logMessage(`Found the foundApid: ${foundApiId}`);

      const data = await this._deployApiGatewayToStage(foundApiId, environment.ShortName, environment.FullName);
      await BlueBirdPromise.delay(delayInMilliseconds);

      this.logMessage(`deployApiGatewayToStageForEnvByGatewayName was a success ${this._getObjectAsString(data)}`);
      return data;
    } catch (err) {
      this.logMessage(err);
      throw err;

    }
  }

  /**
   *
   * @param swaggerEntity
   * @param {boolean} [failOnWarnings=false]
   * @return {Promise<*>}
   * @private
   */
  async _createSwagger(swaggerEntity, failOnWarnings = false) {
    this.logMessage(`createSwagger swagger for [Swagger Title: ${swaggerEntity.info.title}]`);

    try {
      const options = {
        body: JSON.stringify(swaggerEntity),
        failOnWarnings: failOnWarnings
      };

      const data = await this._apiGatewayClient.importRestApi(options).promise();
      this.logMessage(`createSwagger swagger for [Swagger Title: ${swaggerEntity.info.title}] completed`);
      return data;

    } catch (err) {
      this.logMessage(err);
      throw err;
    }

  }

  async _overwriteSwagger(apiGatewayId, swaggerEntity, failOnWarnings = false) {
    this.logMessage(`overwriting swagger for [ApiGatewayId: ${apiGatewayId}]`);

    try {
      const options = {
        restApiId: apiGatewayId,
        body: JSON.stringify(swaggerEntity),
        failOnWarnings: failOnWarnings,
        mode: "overwrite"
      };

      return await this._apiGatewayClient.putRestApi(options).promise();
    } catch (err) {
      this.logMessage(err);
      throw err;
    }
  }
  
  /**
   *
   * @param swaggerEntity
   * @param delayInMilliseconds
   * @param failOnWarnings
   * @returns {Promise<*>}
   */
  async createOrOverwriteApiSwagger(swaggerEntity, delayInMilliseconds = 16000, failOnWarnings = false){

    try {
      let methodName = 'createOrOverwriteApiSwagger';

      if (util.isNullOrUndefined(swaggerEntity)){
          throw new Error(`swaggerEntity is null or undefined [swaggerEntity: ${this._getObjectAsString(swaggerEntity)}]`);
      }

      if (!swaggerEntity.hasOwnProperty("info") || !swaggerEntity.info.hasOwnProperty("title")){
          throw new Error(`swaggerEntity must contain info and title [swaggerEntity: ${this._getObjectAsString(swaggerEntity)}]`);
      }

      if (util.isNullOrUndefined(swaggerEntity.info.title) || swaggerEntity.info.title === ""){
          throw new Error(`swaggerEntity.info.title is null, undefined, or empty [swaggerEntity: ${this._getObjectAsString(swaggerEntity)}]`);
      }

      const foundApi = await this.lookupApiGatewayByName(swaggerEntity.info.title);
      let data;
      if (util.isNullOrUndefined(foundApi)) {
        this.logMessage(`${methodName}: creating api gateway`);
        data = await this._createSwagger(swaggerEntity, failOnWarnings);
        await BlueBirdPromise.delay(delayInMilliseconds);
        return data;
      }

      this.logMessage(`${methodName}: Found the [foundApid: ${JSON.stringify(foundApi.id)}]`);

      data = await this._overwriteSwagger(foundApi.id, swaggerEntity, failOnWarnings);
      await BlueBirdPromise.delay(delayInMilliseconds);
      this.logMessage(`${methodName} was a success ${this._getObjectAsString(data)}`);
      return data;

    } catch (err) {
      this.logMessage(err);
      throw err;
    }
  }
  
  /**
   *
   * @param {string} domainName
   * @param {string} regionalCertificateArn
   * @param {string} endpointConfiguration
   * @returns {Promise<PromiseResult<APIGateway.DomainName, AWSError>>}
   */
  async upsertCustomDomainName(domainName, regionalCertificateArn, endpointConfiguration) {
    try {
    
      //check if domainName exists, if it does return
      const getDomainNameParams = {
        domainName
      };
      
      const result = await this._apiGatewayClient.getDomainName(getDomainNameParams).promise();
      if(!__.isEmpty(result.data)) {
        return;
      }
      
      //create custom domain name
      const createDomainNameParams = {
        domainName,
        regionalCertificateArn,
        endpointConfiguration: {
          types: [endpointConfiguration]
        }
      };
      
      return await this._apiGatewayClient.createDomainName(createDomainNameParams).promise();
      
    } catch(err) {
      this.logMessage(err);
      throw err;
    }
  }
  
  /**
   *
   * @param {string} domainName
   * @param {string} apiGatewayId
   * @param {string} basePath
   * @param {string} stage
   * @returns {void|Promise<PromiseResult<APIGateway.Types.BasePathMapping, AWSError>>}
   */
  async upsertBasePathMapping(domainName, apiGatewayId, basePath, stage) {
    try {
      
      const getBasePathMappingParams = {
        basePath: basePath,
        domainName: domainName
      };
  
      const result = await this._apiGatewayClient.getBasePathMapping(getBasePathMappingParams).promise();
      if(!__.isEmpty(result.data)) {
        return;
      }
      
      
      //create new basePathMapping
      const createBasePathMappingParams = {
        domainName: domainName,
        restApiId: apiGatewayId,
        basePath: basePath,
        stage: stage
      };
      
      return await this._apiGatewayClient.createBasePathMapping(createBasePathMappingParams).promise();
    
    } catch(err) {
      this.logMessage(err);
      throw err;
    }
  }
  
  
  /**
   *
   * @param entity
   * @returns {string}
   * @private
   */
  _getObjectAsString(entity) {
    return util.isNullOrUndefined(entity) ? '' : JSON.stringify(entity);
  }

}

module.exports = APIGatewayClient;
