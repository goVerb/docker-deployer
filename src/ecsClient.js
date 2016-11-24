const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

AWS.config.setPromisesDependency(BlueBirdPromise);


class EcsClient {

  constructor(region = 'us-west-2') {
    this._awsEcsClient = new AWS.ECS({apiVersion: '2014-11-13', region: region});
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
        this.logMessage(`Cluster already exist.  No action taken. [ClusterName: ${clusterName}] [ClusterArn: ${clusterArn}]`);
      }
    });
  }

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

  createOrUpdateService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn) {
    return this.getServiceArn(clusterName, serviceName).then(serviceArn => {
      if(serviceArn) {
        this.logMessage(`Service already exists.  Updating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}] [ServiceArn: ${serviceArn}]`);
        this._updateService(clusterName, serviceName, taskDefinition, desiredCount);
      } else {
        this.logMessage(`Service does not exists.  Creating Service. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
        this._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);
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

    return createServicePromise;
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

    return updateServicePromise;
  }

  getServiceArn(clusterName, serviceName) {
    let params = {
      services: [ serviceName ],
      cluster: clusterName
    };

    this.logMessage(`Looking up ServiceArn by Cluster Name and Service Name. [ClusterName: ${clusterName}] [ServiceName: ${serviceName}]`);
    let describeServicesPromise = this._awsEcsClient.describeServices(params).promise();

    return describeServicesPromise.then(result => {
      this.logMessage(`DescribeServices Results: ${JSON.stringify(result)}`);
      if(result.services && result.services.length > 0) {
        let service = result.services[0];
        return service.status === "ACTiVE" && service.serviceArn;
      } else {
        return '';
      }
    });

  }

  getClusterArn(name) {
    let params = {
      clusters: [ name ]
    };

    this.logMessage(`Looking up ClusterArn by Cluster Name. [ClusterName: ${name}]`);
    let describeClustersPromise = this._awsEcsClient.describeClusters(params).promise();

    return describeClustersPromise.then(result => {
      this.logMessage(`DescribeCluster Results: ${JSON.stringify(result)}`);
      if(result.clusters && result.clusters.length > 0) {
        let cluster = result.clusters[0];
        return cluster.status === "ACTIVE" ? cluster.clusterArn : '';
      } else {
        return '';
      }
    });
  }

  /**
   * Logs messages
   * @param msg
   */
  logMessage(msg) {
    console.log(msg);
  }
}


module.exports = EcsClient;