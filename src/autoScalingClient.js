const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
const base64 = require('base-64');

AWS.config.setPromisesDependency(BlueBirdPromise);


class AutoScalingClient {

  constructor(region = 'us-west-2') {
    this.autoScalingClient = new AWS.AutoScaling({apiVersion: '2015-12-01', region: region});
  }

  /**
   * Creates a Launch Configuration
   * @param name This is the name of the launch configuration.
   * @param imageId This is the AMI Id that will be the base of the Launch Configuration.
   * @param instanceType This is the instance type (size) that will be launched.
   * @param sshKeyName (Optional) This is the sshKeyName associated with the box.
   * @param ecsClusterName (Optional)
   * @return {Promise<D>}
   */
  createLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName = null, ecsClusterName = null) {

    let params = {
      LaunchConfigurationName: name, /* required */
      AssociatePublicIpAddress: true,
      BlockDeviceMappings: [],
      EbsOptimized: false,
      //IamInstanceProfile: 'STRING_VALUE',
      ImageId: imageId,
      InstanceMonitoring: {
        Enabled: false
      },
      InstanceType: instanceType,
      PlacementTenancy: 'default',
      SecurityGroups: [securityGroupId]
    };

    if(sshKeyName) {
      params.KeyName = sshKeyName;
    }

    if(ecsClusterName) {
      let ec2StartupScript = `#!/bin/bash
      echo ECS_CLUSTER=${ecsClusterName} >> /etc/ecs/ecs.config`;

      params.UserData = base64.encode(ec2StartupScript);
    }

    this.logMessage(`Creating Launch Configuration. [Name: ${name}] [Params: ${JSON.stringify(params)}]`);
    let createLaunchConfigurationPromise = this.autoScalingClient.createLaunchConfiguration(params).promise();

    return createLaunchConfigurationPromise;
  }

  createAutoScalingGroup(environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity) {
    let params = {
      AutoScalingGroupName: name, /* required */
      MaxSize: minSize, /* required */
      MinSize: maxSize, /* required */
      AvailabilityZones: [
        'STRING_VALUE',
        /* more items */
      ],
      DefaultCooldown: 0,
      DesiredCapacity: desiredCapacity,
      HealthCheckGracePeriod: 0,
      LaunchConfigurationName: launchConfigurationName,
      NewInstancesProtectedFromScaleIn: false,
      PlacementGroup: 'STRING_VALUE',
      Tags: [
        {
          Key: 'Environment', /* required */
          PropagateAtLaunch: true,
          ResourceType: 'auto-scaling-group',
          Value: environment
        },
        {
          Key: 'Created', /* required */
          PropagateAtLaunch: true,
          ResourceType: 'auto-scaling-group',
          Value: moment.format()
        }
      ],
      TargetGroupARNs: [
        'STRING_VALUE',
        /* more items */
      ],
      VPCZoneIdentifier: 'STRING_VALUE'
    };

    let createAutoScalingGroupPromise = this.autoScalingClient.createAutoScalingGroup(params).promise();


    return createAutoScalingGroupPromise;
  }

  /**
   * Logs messages
   * @param msg
   */
  logMessage(msg) {
    console.log(msg);
  }
}


module.exports = AutoScalingClient;