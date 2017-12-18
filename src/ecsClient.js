const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BlueBirdPromise);

class EcsClient extends BaseClient {

  get _awsEcsClient() {
    if(!this._internalEcsClient) {
      let params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2014-11-13',
        region: this._region
      };
      this._internalEcsClient = new AWS.ECS(params);
    }

    return this._internalEcsClient;
  }

  /**
   * Creates a ECS Cluster with the specified name.  If cluster already exist, no action is taken.
   * @param clusterName
   * @return {Promise.<TResult>|*}
   */
  async createCluster(clusterName) {

    try {
      const clusterArn = await this.getClusterArn(clusterName);

      if(!clusterArn) {
        return this._createCluster(clusterName);
      } else {
        this.logMessage(`Cluster already exists.  No action taken. [ClusterName: ${clusterName}] [ClusterArn: ${clusterArn}]`);
      }

    } catch (err) {
      if (err.code === 'ClusterNotFoundException') {
        this.logMessage(`Cluster does not exist.  Creating Cluster. [ClusterName: ${clusterName}]`);
        return this._createCluster(clusterName);
      }
    }
  }

  /**
   *
   * @param clusterName
   * @return {Promise<D>}
   * @private
   */
  async _createCluster(clusterName) {
    let params = {
      clusterName: clusterName
    };

    this.logMessage(`Creating ECS Cluster. [ClusterName: ${clusterName}]`);
    return await this._awsEcsClient.createCluster(params).promise();
  }

  /**
   *
   * @param taskName
   * @param networkMode Possible values: 'bridge' | 'host' | 'none'
   * @param taskRoleArn
   * @param containerDefinitions
   *
   * @return {Promise<D>}
   */
  async registerTaskDefinition(taskName, networkMode, taskRoleArn, containerDefinitions) {
    let params = {
      containerDefinitions: containerDefinitions,
      family: taskName, /* required */
      networkMode: networkMode,
      taskRoleArn: taskRoleArn,
      volumes: []
    };

    return await this._awsEcsClient.registerTaskDefinition(params).promise();
  }

  /**
   *
   * @param clusterName
   * @param serviceName
   * @param taskDefinition
   * @param desiredCount
   * @param containerName
   * @param containerPort
   * @param targetGroupArn
   * @return {Promise.<TResult>}
   */
  async createOrUpdateService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn) {
    try {
      const serviceArn = await this.getServiceArn(clusterName, serviceName);

      if(serviceArn) {
        this.logMessage(`Service already exists.  Updating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}] [ServiceArn: ${serviceArn}]`);
        return await this._updateService(clusterName, serviceName, taskDefinition, desiredCount);
      } else {
        this.logMessage(`Service does not exists.  Creating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
        return await this._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);
      }
    } catch (err) {
      if (err.code === 'ClusterNotFoundException') {
        this.logMessage(`Service does not exists.  Creating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
        return await this._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);
      }
    }
  }

  /**
   *
   * @param clusterName
   * @param serviceName
   * @param taskDefinition
   * @param desiredCount
   * @param containerName
   * @param containerPort
   * @param targetGroupArn
   * @return {Promise}
   */
  async _createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn) {

    let params = {
      desiredCount: desiredCount, /* required */
      serviceName: serviceName, /* required */
      taskDefinition: taskDefinition, /* required */
      //clientToken: 'STRING_VALUE',
      cluster: clusterName,
      deploymentConfiguration: {
        maximumPercent: 200,
        minimumHealthyPercent: 50
      },
      loadBalancers: [
        {
          containerName: containerName,
          containerPort: containerPort,
          targetGroupArn: targetGroupArn
        }
      ],
      role: 'ecsServiceRole'
    };

    this.logMessage(`Creating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
    const createServiceResult = await this._awsEcsClient.createService(params).promise();

    this.logMessage(`CreateService Results: ${JSON.stringify(createServiceResult)}`);
  }

  /**
   *
   * @param clusterName
   * @param serviceName
   * @param taskDefinition
   * @param desiredCount
   * @return {Promise}
   */
  async _updateService(clusterName, serviceName, taskDefinition, desiredCount) {

    try {
      let params = {
        service: serviceName, /* required */
        cluster: clusterName,
        desiredCount: desiredCount,
        taskDefinition: taskDefinition
      };

      this.logMessage(`Updating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
      const updateServiceResult = this._awsEcsClient.updateService(params).promise();

      this.logMessage(`UpdateService Results: ${JSON.stringify(updateServiceResult)}`);
    } catch (err) {
      this.logMessage(`UpdateService Error: ${JSON.stringify(err)}`);
    }
  }

  /**
   *
   * @param clusterName
   * @param serviceName
   * @return {Promise.<TResult>}
   */
  async getServiceArn(clusterName, serviceName) {
    let params = {
      services: [ serviceName ],
      cluster: clusterName
    };

    this.logMessage(`Looking up ServiceArn by Cluster Name and Service Name. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
    const describeServicesResult = await this._awsEcsClient.describeServices(params).promise();

    this.logMessage(`DescribeServices Results: ${JSON.stringify(describeServicesResult)}`);
    let returnServiceArn = '';
    if(describeServicesResult.services && describeServicesResult.services.length > 0) {
      let service = __.filter(describeServicesResult.services, { status: 'ACTIVE' });
      if(service[0]) {
        returnServiceArn = service[0].serviceArn;
      }
    }

    return returnServiceArn;
  }

  /**
   *
   * @param name
   * @return {Promise.<TResult>}
   */
  async getClusterArn(name) {
    let params = {
      clusters: [ name ]
    };

    this.logMessage(`Looking up ClusterArn by Cluster Name. [ClusterName: ${name}]`);
    const describeClustersResult = await this._awsEcsClient.describeClusters(params).promise();

    this.logMessage(`DescribeCluster Results: ${JSON.stringify(describeClustersResult)}`);
    let returnClusterArn = '';
    if(describeClustersResult && describeClustersResult.clusters && describeClustersResult.clusters.length > 0) {
      let cluster = __.filter(describeClustersResult.clusters, { status: 'ACTIVE' });
      if(cluster[0]) {
        return cluster[0].clusterArn;
      }
    }
    return returnClusterArn;
  }
}


module.exports = EcsClient;
