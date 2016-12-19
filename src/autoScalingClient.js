const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
const base64 = require('base-64');

AWS.config.setPromisesDependency(BlueBirdPromise);


class AutoScalingClient {

  constructor(accessKey = '', secretKey = '', region = 'us-west-2') {

    this._accessKey = accessKey;
    this._secretKey = secretKey;
    this._region = region;
  }

  get _awsAutoScalingClient() {

    if(!this._internalAutoScalingClient) {
      let params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2011-01-01',
        region: this._region
      };
      this._internalAutoScalingClient = new AWS.AutoScaling(params);
    }

    return this._internalAutoScalingClient;
  }

  //TODO: Create a createOrUpdate method for AutoScalingGroup and LaunchConfiguration

  /**
   *
   * @param launchConfigurationConfig
   * {
   *     name: <Name of the launch configuration>,
   *     baseImageId: <ImageId that will be the base AMI for the EC2 instances>,
   *     securityGroupId: <id of the security group to be applied to the EC2 instances>,
   *     instanceType: <Instance type that will be used for the EC2 instances,
   *     sshKeyName: (Optional) SSH Key associated with the EC2 instances
   *     ecsClusterName: (Optional) <This is the ECS cluster that will be associated with the launch configuration>
   *   }
   * @return {Promise.<TResult>|*}
   */
  createLaunchConfigurationFromConfig(launchConfigurationConfig) {
    return this.getLaunchConfigurationArn(launchConfigurationConfig.name).then(launchConfigurationArn => {
      if(!launchConfigurationArn) {
        return this._createLaunchConfiguration(launchConfigurationConfig.name,
          launchConfigurationConfig.baseImageId,
          launchConfigurationConfig.securityGroupId,
          launchConfigurationConfig.instanceType,
          launchConfigurationConfig.sshKeyName,
          launchConfigurationConfig.ecsClusterName);
      } else {
        this.logMessage(`LaunchConfiguration already exists. No Action taken. [LaunchConfigurationName: ${launchConfigurationConfig.name}] [LaunchConfigurationArn: ${launchConfigurationArn}]`);
      }
    });
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
  _createLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName = null, ecsClusterName = null) {

    let params = {
      LaunchConfigurationName: name, /* required */
      AssociatePublicIpAddress: true,
      BlockDeviceMappings: [],
      EbsOptimized: false,
      IamInstanceProfile: 'ecsInstanceRole',
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
      /*esfmt-ignore-start*/
      let ec2StartupScript = `#!/bin/bash
echo ECS_CLUSTER=${ecsClusterName} >> /etc/ecs/ecs.config`;
      /*esfmt-ignore-end*/
      params.UserData = base64.encode(ec2StartupScript);
    }

    this.logMessage(`Creating Launch Configuration. [Name: ${name}] [Params: ${JSON.stringify(params)}]`);
    let createLaunchConfigurationPromise = this._awsAutoScalingClient.createLaunchConfiguration(params).promise();

    return createLaunchConfigurationPromise;
  }


  /**
   *
   * @param environment
   * @param name
   * @param launchConfigurationName
   * @param minSize
   * @param maxSize
   * @param desiredCapacity
   * @param targetGroupArns
   * @param vpcSubnets
   * @return {Promise.<TResult>|*}
   */
  createAutoScalingGroup(environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets) {
    return this.getAutoScalingGroupArn(name).then(autoScalingGroupArn => {
      if(!autoScalingGroupArn) {
        return this._createAutoScalingGroup(environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);
      } else {
        this.logMessage(`AutoScalingGroup already exists. No Action taken. [AutoScalingGroupName: ${name}] [AutoScalingGroupArn: ${autoScalingGroupArn}]`);
      }
    });
  }

  /**
   *
   * @param environment
   * @param name (Required)
   * @param launchConfigurationName
   * @param minSize
   * @param maxSize
   * @param desiredCapacity
   * @param targetGroupArns This is an array of TargetGroupArns
   * @param vpcSubnets This is a CSV of subnets where the instances will be launched into
   * @return {Promise<D>}
   */
  _createAutoScalingGroup(environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets) {


    let formattedTargetGroupArns = targetGroupArns;
    if(!__.isArray(formattedTargetGroupArns)) {
      formattedTargetGroupArns = [targetGroupArns];
    }


    let params = {
      AutoScalingGroupName: name, /* required */
      MaxSize: maxSize, /* required */
      MinSize: minSize, /* required */
      DefaultCooldown: 300,
      DesiredCapacity: desiredCapacity,
      HealthCheckGracePeriod: 0,
      LaunchConfigurationName: launchConfigurationName,
      NewInstancesProtectedFromScaleIn: false,
      Tags: [
        {
          Key: 'Name', /* required */
          PropagateAtLaunch: true,
          ResourceType: 'auto-scaling-group',
          Value: `${environment} - ECS Instance`
        },
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
          Value: moment().format()
        }
      ],
      TargetGroupARNs: formattedTargetGroupArns,
      VPCZoneIdentifier: vpcSubnets
    };

    let createAutoScalingGroupPromise = this._awsAutoScalingClient.createAutoScalingGroup(params).promise();


    return createAutoScalingGroupPromise;
  }

  /**
   *
   * @param launchConfigurationName
   * @return {Promise.<TResult>}
   */
  getLaunchConfigurationArn(launchConfigurationName) {
    let params = {
      LaunchConfigurationNames: [launchConfigurationName]
    };

    let describeLaunchConfigurationPromise = this._awsAutoScalingClient.describeLaunchConfigurations(params).promise();

    return describeLaunchConfigurationPromise.then(result => {
      if(result && result.LaunchConfigurations && result.LaunchConfigurations.length > 0) {
        return result.LaunchConfigurations[0].LaunchConfigurationARN;
      } else {
        return '';
      }
    });

  }

  getAutoScalingGroupArn(autoScalingGroupName) {
    let params = {
      AutoScalingGroupNames: [autoScalingGroupName]
    };

    let describeAutoScalingGroupsPromise = this._awsAutoScalingClient.describeAutoScalingGroups(params).promise();

    return describeAutoScalingGroupsPromise.then(result => {
      if(result && result.AutoScalingGroups && result.AutoScalingGroups.length > 0) {
        return result.AutoScalingGroups[0].AutoScalingGroupARN;
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


module.exports = AutoScalingClient;
