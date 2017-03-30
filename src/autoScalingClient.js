const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
const base64 = require('base-64');

const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BlueBirdPromise);


class AutoScalingClient extends BaseClient {

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


  /**
   *
   * @param launchConfigurationConfig
   * @param launchConfigurationConfig.name Name of the launch configuration
   * @param launchConfigurationConfig.baseImageId ImageId that will be the base AMI for the EC2 instances
   * @param launchConfigurationConfig.securityGroupId id of the security group to be applied to the EC2 instances
   * @param launchConfigurationConfig.instanceType Instance type that will be used for the EC2 instances
   * @param launchConfigurationConfig.sshKeyName (Optional) SSH Key associated with the EC2 instances
   * @param launchConfigurationConfig.ecsClusterName (Optional) <This is the ECS cluster that will be associated with the launch configuration
   * @return {Promise.<TResult>}
   */
  createOrUpdateLaunchConfigurationFromConfig(launchConfigurationConfig) {
    let launchConfigurationNameToDelete = ''; // default, assuming that the LC doesn't exist therefore nothing needs to be deleted
    let launchConfigurationNameToReturn = launchConfigurationConfig.name; // default, assuming that the LC doesn't exist and will be created

    return this.getLaunchConfiguration(launchConfigurationConfig.name).then(foundLaunchConfiguration => {
      if (!foundLaunchConfiguration) {
        this.logMessage(`LaunchConfiguration not found. Creating [LaunchConfigurationName: ${launchConfigurationConfig.name}]`);
        return this._createOrUpdateLaunchConfiguration(launchConfigurationConfig.name,
          launchConfigurationConfig.baseImageId,
          launchConfigurationConfig.securityGroupId,
          launchConfigurationConfig.instanceType,
          launchConfigurationConfig.sshKeyName,
          launchConfigurationConfig.ecsClusterName);
      } else if (this._isLaunchConfigurationOutOfDate(launchConfigurationConfig, foundLaunchConfiguration)) {
        this.logMessage(`LaunchConfiguration already exists but is out of date. Updating [LaunchConfigurationName: ${launchConfigurationConfig.name}] [FoundLaunchConfiguration: ${JSON.stringify(foundLaunchConfiguration)}]`);
        launchConfigurationConfig.name = this._newLaunchConfigurationName(foundLaunchConfiguration.LaunchConfigurationName);
        return this._createOrUpdateLaunchConfiguration(launchConfigurationConfig.name,
          launchConfigurationConfig.baseImageId,
          launchConfigurationConfig.securityGroupId,
          launchConfigurationConfig.instanceType,
          launchConfigurationConfig.sshKeyName,
          launchConfigurationConfig.ecsClusterName)
          .then(() => {
            launchConfigurationNameToDelete = foundLaunchConfiguration.LaunchConfigurationName;
            launchConfigurationNameToReturn = launchConfigurationConfig.name;
          });
      } else {
        this.logMessage(`LaunchConfiguration already exists and is up to date. No action taken. [LaunchConfigurationName: ${JSON.stringify(launchConfigurationConfig)}] [FoundLaunchConfiguration: ${JSON.stringify(foundLaunchConfiguration)}]`);
        launchConfigurationNameToReturn = foundLaunchConfiguration.LaunchConfigurationName;
      }
    }).then(() => {
      return {
        newLaunchConfigName: launchConfigurationNameToReturn,
        oldLaunchConfigName: launchConfigurationNameToDelete
      };
    });
  }


  /**
   *
   * @param launchConfigurationConfig Desired configuration
   * @param foundLaunchConfiguration Actual configuration
   * @return {boolean}
   * @private
   */
  _isLaunchConfigurationOutOfDate(launchConfigurationConfig, foundLaunchConfiguration) {

    const {
      name,
      baseImageId,
      securityGroupId,
      instanceType
    } = launchConfigurationConfig;

    // Disabled for now because the versions won't match.  (E.g. '***REMOVED*** ECS LC - Dev' !== '***REMOVED*** ECS LC - Dev - v26')
    // if(name !== foundLaunchConfiguration.LaunchConfigurationName) {
    //   return true;
    // }

    if(baseImageId !== foundLaunchConfiguration.ImageId) {
      return true;
    }

    if(0 > __.indexOf(foundLaunchConfiguration.SecurityGroups, securityGroupId)) {
      return true;
    }

    if(instanceType !== foundLaunchConfiguration.InstanceType) {
      return true;
    }

    return false;
  }


  /**
   *
   * @param oldLaunchConfigurationName Current name for configuration needing to be incremented
   * @return {boolean}
   * @private
   */
  _newLaunchConfigurationName(oldLaunchConfigurationName) {
    const oldNumber = (oldLaunchConfigurationName.match(/(\d+)$/)) ? oldLaunchConfigurationName.match(/(\d+)$/)[0] : null;

    const newNumber = (oldNumber) ? parseInt(oldNumber, 10) + 1 : 1;

    const versionSuffix = (oldLaunchConfigurationName.includes(' - v')) ? '' : ' - v';

    const newPrefix = (oldNumber) ? oldLaunchConfigurationName.substr(0, oldLaunchConfigurationName.length - oldNumber.length) : oldLaunchConfigurationName;

    console.log(newPrefix + versionSuffix + newNumber);

    return newPrefix + versionSuffix + newNumber;
  }


  /**
   * Creates a Launch Configuration
   * @param name This is the name of the launch configuration.
   * @param imageId This is the AMI Id that will be the base of the Launch Configuration.
   * @param securityGroupId This is the associated security group.
   * @param instanceType This is the instance type (size) that will be launched.
   * @param sshKeyName (Optional) This is the sshKeyName associated with the box.
   * @param ecsClusterName (Optional)
   * @return {Promise<D>}
   */
  _createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName = null, ecsClusterName = null) {

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
   * @param params
   * @param params.environment
   * @param params.name
   * @param params.launchConfigurationName
   * @param params.minSize
   * @param params.maxSize
   * @param params.desiredCapacity
   * @param params.targetGroupArns
   * @param params.vpcSubnets
   * @param launchConfigToDeleteName
   * @return {Promise.<TResult>|*}
   */
  createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName) {
    let {environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets} = params;
    return this.getAutoScalingGroup(name).then(foundAutoScalingGroup => {
      if(!foundAutoScalingGroup) {
        return this._createAutoScalingGroup(environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);
      } else {
        if(this._isAutoScalingGroupOutOfDate(params, foundAutoScalingGroup)) {
          this.logMessage(`AutoScalingGroup already exists but is out of date. Updating [AutoScalingGroupName: ${name}] [FoundAutoScalingGroup: ${JSON.stringify(foundAutoScalingGroup)}]`);
          return this._updateAutoScalingGroup(environment,
            name,
            launchConfigurationName,
            minSize,
            maxSize,
            desiredCapacity,
            targetGroupArns,
            vpcSubnets);
        } else {
          this.logMessage(`AutoScalingGroup already exists and is up to date. No Action taken. [AutoScalingGroupName: ${name}] [FoundAutoScalingGroup: ${JSON.stringify(foundAutoScalingGroup)}]`);
        }
      }
    }).then(() => {
      if(launchConfigToDeleteName) {
        return this.deleteLaunchConfiguration(launchConfigToDeleteName);
      }
    });
  }


  /**
   *
   * @param autoScalingParams Desired configuration
   * @param foundAutoScalingGroup Actual configuration
   * @return {boolean}
   * @private
   */
  _isAutoScalingGroupOutOfDate(autoScalingParams, foundAutoScalingGroup) {

    let newAutoScalingParams = this._generateAutoScalingParams(autoScalingParams, false);

    const {
      AutoScalingGroupName,
      MaxSize,
      MinSize,
      DefaultCooldown,
      DesiredCapacity,
      HealthCheckGracePeriod,
      LaunchConfigurationName,
      NewInstancesProtectedFromScaleIn,
      VPCZoneIdentifier
    } = newAutoScalingParams;


    if(AutoScalingGroupName !== foundAutoScalingGroup.AutoScalingGroupName) {
      return true;
    }

    if(MaxSize !== foundAutoScalingGroup.MaxSize) {
      return true;
    }

    if(MinSize !== foundAutoScalingGroup.MinSize) {
      return true;
    }

    if(DefaultCooldown !== foundAutoScalingGroup.DefaultCooldown) {
      return true;
    }

    if(DesiredCapacity !== foundAutoScalingGroup.DesiredCapacity) {
      return true;
    }

    if(HealthCheckGracePeriod !== foundAutoScalingGroup.HealthCheckGracePeriod) {
      return true;
    }

    if(LaunchConfigurationName !== foundAutoScalingGroup.LaunchConfigurationName) {
      return true;
    }

    if(NewInstancesProtectedFromScaleIn !== foundAutoScalingGroup.NewInstancesProtectedFromScaleIn) {
      return true;
    }

    // Can't check tags using describe
    // if(!__.isEqual(Tags.sort(), foundAutoScalingGroup.Tags.sort())) {
    //   return true;
    // }

    if(VPCZoneIdentifier !== foundAutoScalingGroup.VPCZoneIdentifier) {
      return true;
    }

    return false;
  }


  /**
   *
   * @param isCreate Determines whether to generate params for a create or and update
   * @param config
   * @param config.environment
   * @param config.name
   * @param config.launchConfigurationName
   * @param config.minSize
   * @param config.maxSize
   * @param config.desiredCapacity
   * @param config.targetGroupArns
   * @param config.vpcSubnets
   * @return {Promise.<TResult>|*}
   */
  _generateAutoScalingParams(config, isCreate = true) {
    const {environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets} = config;
    let formattedTargetGroupArns = targetGroupArns;
    if(isCreate && !__.isArray(formattedTargetGroupArns)) {
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
      VPCZoneIdentifier: vpcSubnets
    };

    if (isCreate) {
      params.Tags = [
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
      ];
      params.TargetGroupARNs = formattedTargetGroupArns;
    }

    return params;
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
    const config = {environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets};

    let params = this._generateAutoScalingParams(config, true);

    let createAutoScalingGroupPromise = this._awsAutoScalingClient.createAutoScalingGroup(params).promise();

    return createAutoScalingGroupPromise;
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
  _updateAutoScalingGroup(environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets) {
    const config = {environment, name, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets};

    let params = this._generateAutoScalingParams(config, false);

    let updateAutoScalingGroupPromise = this._awsAutoScalingClient.updateAutoScalingGroup(params).promise();

    return updateAutoScalingGroupPromise;
  }


  /**
   *
   * @param launchConfigurationName
   * @return {Promise.<TResult>}
   */
  getLaunchConfiguration(launchConfigurationName) {
    let params = {
      // Disabled launch config for now
      // LaunchConfigurationNames: [launchConfigurationName]
    };

    let describeLaunchConfigurationPromise = this._awsAutoScalingClient.describeLaunchConfigurations(params).promise();

    return describeLaunchConfigurationPromise.then(result => {
      if(result && result.LaunchConfigurations && result.LaunchConfigurations.length > 0) {
        return this._getLatestLaunchConfig(result.LaunchConfigurations, launchConfigurationName);
      } else {
        return '';
      }
    });

  }


  /**
   *
   * @param LaunchConfigurations
   * @param launchConfigurationName
   * @return {object|string}
   */
  _getLatestLaunchConfig(LaunchConfigurations, launchConfigurationName) {
    const filteredLaunchConfigs = LaunchConfigurations.filter(each => {
      return each.LaunchConfigurationName.includes(launchConfigurationName);
    });

    if(__.isEmpty(filteredLaunchConfigs)) {
      return '';
    } else if(filteredLaunchConfigs.length > 1) {
      return filteredLaunchConfigs.reduce((acc, val) => {
        if(__.isEmpty(acc)) {
          return val;
        }
        const accVersion = (acc.LaunchConfigurationName.match(/(\d+)$/)) ? parseInt(acc.LaunchConfigurationName.match(/(\d+)$/)[0]) : null;
        const valVersion = (val.LaunchConfigurationName.match(/(\d+)$/)) ? parseInt(val.LaunchConfigurationName.match(/(\d+)$/)[0]) : null;
        if(!accVersion || valVersion > accVersion) {
          return val;
        }

        return acc;
      }, {});
    } else {
      return filteredLaunchConfigs[0];
    }
  }


  /**
   *
   * @param name (Required)
   * @return {Promise<D>}
   */
  deleteLaunchConfiguration(name) {
    const params = {
      LaunchConfigurationName: name
    };

    let deleteLaunchConfigurationPromise = this._awsAutoScalingClient.deleteLaunchConfiguration(params).promise();

    return deleteLaunchConfigurationPromise;
  }


  /**
   *
   * @param autoScalingGroupName
   * @return {object|string}
   */
  getAutoScalingGroup(autoScalingGroupName) {
    let params = {
      AutoScalingGroupNames: [autoScalingGroupName]
    };

    let describeAutoScalingGroupsPromise = this._awsAutoScalingClient.describeAutoScalingGroups(params).promise();

    return describeAutoScalingGroupsPromise.then(result => {
      if(result && result.AutoScalingGroups && result.AutoScalingGroups.length > 0) {
        return result.AutoScalingGroups[0];
      } else {
        return '';
      }
    });
  }
}


module.exports = AutoScalingClient;
