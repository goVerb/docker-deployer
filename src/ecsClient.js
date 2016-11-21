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

  createService() {
    let params = {
      desiredCount: 0, /* required */
      serviceName: 'STRING_VALUE', /* required */
      taskDefinition: 'STRING_VALUE', /* required */
      clientToken: 'STRING_VALUE',
      cluster: 'STRING_VALUE',
      deploymentConfiguration: {
        maximumPercent: 0,
        minimumHealthyPercent: 0
      },
      loadBalancers: [
        {
          containerName: 'STRING_VALUE',
          containerPort: 0,
          loadBalancerName: 'STRING_VALUE',
          targetGroupArn: 'STRING_VALUE'
        },
        /* more items */
      ],
      role: 'STRING_VALUE'
    };

    let createServicePromise = this.ecsClient.createService(params).promise();

    return createServicePromise;
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