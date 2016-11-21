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
   * @return {Promise<D>}
   */
  registerTaskDefinition(taskName, networkMode, taskRoleArn, containerDefinitions) {
    var params = {
      containerDefinitions: [ /* required */
        {
          command: [
            'STRING_VALUE',
            /* more items */
          ],
          cpu: 0,
          disableNetworking: true || false,
          dnsSearchDomains: [
            'STRING_VALUE',
            /* more items */
          ],
          dnsServers: [
            'STRING_VALUE',
            /* more items */
          ],
          dockerLabels: {
            someKey: 'STRING_VALUE',
            /* anotherKey: ... */
          },
          dockerSecurityOptions: [
            'STRING_VALUE',
            /* more items */
          ],
          entryPoint: [
            'STRING_VALUE',
            /* more items */
          ],
          environment: [
            {
              name: 'STRING_VALUE',
              value: 'STRING_VALUE'
            },
            /* more items */
          ],
          essential: true || false,
          extraHosts: [
            {
              hostname: 'STRING_VALUE', /* required */
              ipAddress: 'STRING_VALUE' /* required */
            },
            /* more items */
          ],
          hostname: 'STRING_VALUE',
          image: 'STRING_VALUE',
          links: [
            'STRING_VALUE',
            /* more items */
          ],
          logConfiguration: {
            logDriver: 'json-file | syslog | journald | gelf | fluentd | awslogs | splunk', /* required */
            options: {
              someKey: 'STRING_VALUE',
              /* anotherKey: ... */
            }
          },
          memory: 0,
          memoryReservation: 0,
          mountPoints: [
            {
              containerPath: 'STRING_VALUE',
              readOnly: true || false,
              sourceVolume: 'STRING_VALUE'
            },
            /* more items */
          ],
          name: 'STRING_VALUE',
          portMappings: [
            {
              containerPort: 0,
              hostPort: 0,
              protocol: 'tcp | udp'
            },
            /* more items */
          ],
          privileged: true || false,
          readonlyRootFilesystem: true || false,
          ulimits: [
            {
              hardLimit: 0, /* required */
              name: 'core | cpu | data | fsize | locks | memlock | msgqueue | nice | nofile | nproc | rss | rtprio | rttime | sigpending | stack', /* required */
              softLimit: 0 /* required */
            },
            /* more items */
          ],
          user: 'STRING_VALUE',
          volumesFrom: [
            {
              readOnly: true || false,
              sourceContainer: 'STRING_VALUE'
            },
            /* more items */
          ],
          workingDirectory: 'STRING_VALUE'
        }
      ],
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