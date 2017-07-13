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
  createCluster(clusterName) {
    return this.getClusterArn(clusterName).then(clusterArn => {
      if(!clusterArn) {
        return this._createCluster(clusterName);
      } else {
        this.logMessage(`Cluster already exists.  No action taken. [ClusterName: ${clusterName}] [ClusterArn: ${clusterArn}]`);
      }
    }).catch(err => {
      if (err.code === 'ClusterNotFoundException') {
        this.logMessage(`Cluster does not exist.  Creating Cluster. [ClusterName: ${clusterName}]`);
        return this._createCluster(clusterName);
      }
    });
  }

  /**
   *
   * @param clusterName
   * @return {Promise<D>}
   * @private
   */
  _createCluster(clusterName) {
    let params = {
      clusterName: clusterName
    };

    this.logMessage(`Creating ECS Cluster. [ClusterName: ${clusterName}]`);
    let createClusterPromise = this._awsEcsClient.createCluster(params).promise();

    return createClusterPromise;
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
  registerTaskDefinition(taskName, networkMode, taskRoleArn, containerDefinitions) {
    let params = {
      containerDefinitions: containerDefinitions,
      family: taskName, /* required */
      networkMode: networkMode,
      taskRoleArn: taskRoleArn,
      volumes: []
    };

    let registerTaskDefinitionPromise = this._awsEcsClient.registerTaskDefinition(params).promise();

    return registerTaskDefinitionPromise;
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
  createOrUpdateService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn) {
    return this.getServiceArn(clusterName, serviceName).then(serviceArn => {
      if(serviceArn) {
        this.logMessage(`Service already exists.  Updating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}] [ServiceArn: ${serviceArn}]`);
        return this._updateService(clusterName, serviceName, taskDefinition, desiredCount);
      } else {
        this.logMessage(`Service does not exists.  Creating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
        return this._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);
      }
    }).catch(err => {
      if (err.code === 'ClusterNotFoundException') {
        this.logMessage(`Service does not exists.  Creating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
        return this._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);
      }
    });



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
   * @return {Promise<D>}
   */
  _createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn) {

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
    let createServicePromise = this._awsEcsClient.createService(params).promise();

    return createServicePromise.then(result => {
      this.logMessage(`CreateService Results: ${JSON.stringify(result)}`);
    });
  }

  /**
   *
   * @param clusterName
   * @param serviceName
   * @param taskDefinition
   * @param desiredCount
   * @return {Promise<D>}
   */
  _updateService(clusterName, serviceName, taskDefinition, desiredCount) {
    let params = {
      service: serviceName, /* required */
      cluster: clusterName,
      desiredCount: desiredCount,
      taskDefinition: taskDefinition
    };

    this.logMessage(`Updating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
    let updateServicePromise = this._awsEcsClient.updateService(params).promise();

    return updateServicePromise.then(result => {
      this.logMessage(`UpdateService Results: ${JSON.stringify(result)}`);
    });
  }

  /**
   *
   * @param clusterName
   * @param serviceName
   * @return {Promise.<TResult>}
   */
  getServiceArn(clusterName, serviceName) {
    let params = {
      services: [ serviceName ],
      cluster: clusterName
    };

    this.logMessage(`Looking up ServiceArn by Cluster Name and Service Name. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
    let describeServicesPromise = this._awsEcsClient.describeServices(params).promise();

    return describeServicesPromise.then(result => {
      this.logMessage(`DescribeServices Results: ${JSON.stringify(result)}`);
      let returnServiceArn = '';
      if(result.services && result.services.length > 0) {
        let service = __.filter(result.services, {status: 'ACTIVE'});
        if(service[0]) {
          returnServiceArn = service[0].serviceArn;
        }
      }

      return returnServiceArn;
    });

  }

  /**
   *
   * @param name
   * @return {Promise.<TResult>}
   */
  getClusterArn(name) {
    let params = {
      clusters: [ name ]
    };

    this.logMessage(`Looking up ClusterArn by Cluster Name. [ClusterName: ${name}]`);
    let describeClustersPromise = this._awsEcsClient.describeClusters(params).promise();

    return describeClustersPromise.then(result => {
      this.logMessage(`DescribeCluster Results: ${JSON.stringify(result)}`);
      let returnClusterArn = '';
      if(result && result.clusters && result.clusters.length > 0) {
        let cluster = __.filter(result.clusters, {status: 'ACTIVE'});
        if(cluster[0]) {
          return cluster[0].clusterArn;
        }
      }

      return returnClusterArn;
    });
  }

}


module.exports = EcsClient;
