const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

AWS.config.setPromisesDependency(BlueBirdPromise);


class EcsClient {

  constructor(region = 'us-west-2') {
    this.ecsClient = new AWS.ECS({apiVersion: '2014-11-13', region: region});
  }

  createCluster(clusterName) {
    let params = {
      clusterName: clusterName
    };

    this.logMessage(`Creating ECS Cluster. [ClusterName: ${clusterName}]`);
    let createClusterPromise = this.ecsClient.createCluster(params).promise();

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
    var params = {
      containerDefinitions: containerDefinitions,
      family: taskName, /* required */
      networkMode: networkMode,
      taskRoleArn: taskRoleArn,
      volumes: []
    };

    let registerTaskDefinitionPromise = this.ecsClient.registerTaskDefinition(params).promise();

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
   * @return {Promise<D>}
   */
  createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn) {

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

    let createServicePromise = this.ecsClient.createService(params).promise();

    return createServicePromise;
  }

  updateService(clusterName, serviceName, taskDefinition, desiredCount) {
    let params = {
      service: serviceName, /* required */
      cluster: clusterName,
      desiredCount: desiredCount,
      taskDefinition: taskDefinition
    };

    let updateServicePromise = this.ecsClient.updateService(params).promise();

    return updateServicePromise;
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