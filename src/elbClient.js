const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

AWS.config.setPromisesDependency(BlueBirdPromise);


class ElbClient {

  constructor(region = 'us-west-2') {
    this._awsElbv2Client = new AWS.ELBv2({apiVersion: '2015-12-01', region: region});
  }

  /**
   *
   * @param environment
   * @param appElbName
   * @param subnetIds
   * @param scheme Possible Values: 'internet-facing' | 'internal'
   * @param securityGroupIds
   */
  createApplicationLoadBalancer(environment, appElbName, subnetIds, scheme, securityGroupIds) {
    let params = {
      Name: appElbName, /* required */
      Subnets: subnetIds,
      Scheme: scheme,
      SecurityGroups: securityGroupIds,
      Tags: [
        { Key: 'Environment', Value: environment },
        { Key: 'Created', Value: moment().format() }
      ]
    };

    this.logMessage(`Creating Application Load Balancer. [Name: ${appElbName}]`);
    let createAppLoadBalancerPromise = this._awsElbv2Client.createLoadBalancer(params).promise();

    return createAppLoadBalancerPromise.then(result => {
      if(result.LoadBalancers && result.LoadBalancers.length > 0) {
        return result.LoadBalancers[0].LoadBalancerName;
      } else {
        return '';
      }
    });
  }

  /**
   *
   * @param environment
   * @param name
   * @param port
   * @param protocol (Required) Possible Values: HTTP | HTTPS
   * @param vpcId (Required) This is the VpcId where the instances will live.
   * @param healthCheckSettingOverrides (Optional)
   * @return {Promise<D>}
   */
  createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides = {}) {
    if(protocol.toLocaleUpperCase() !== 'HTTP' && protocol.toLocaleUpperCase() !== 'HTTPS') {
      throw new Error(`Invalid protocol parameter value.  Value must be HTTP or HTTPs.  [Value: ${protocol}]`);
    }

    let params = {
      Name: name, /* required */
      Port: port, /* required */
      Protocol: protocol, /* required */
      VpcId: vpcId, /* required */
    };

    if(healthCheckSettingOverrides) {
      if(healthCheckSettingOverrides.HealthCheckIntervalSeconds) {
        this.logMessage(`Assigning HealthCheckIntervalSeconds override value. [Value: ${healthCheckSettingOverrides.HealthCheckIntervalSeconds}]`);
        params.HealthCheckIntervalSeconds = healthCheckSettingOverrides.HealthCheckIntervalSeconds;
      }

      if(healthCheckSettingOverrides.HealthCheckPath) {
        this.logMessage(`Assigning HealthCheckPath override value. [Value: ${healthCheckSettingOverrides.HealthCheckPath}]`);
        params.HealthCheckPath = healthCheckSettingOverrides.HealthCheckPath;
      }

      if(healthCheckSettingOverrides.HealthCheckPort) {
        this.logMessage(`Assigning HealthCheckPort override value. [Value: ${healthCheckSettingOverrides.HealthCheckPort}]`);
        params.HealthCheckPort = healthCheckSettingOverrides.HealthCheckPort;
      }

      if(healthCheckSettingOverrides.HealthCheckProtocol) {
        this.logMessage(`Assigning HealthCheckProtocol override value. [Value: ${healthCheckSettingOverrides.HealthCheckProtocol}]`);
        params.HealthCheckProtocol = healthCheckSettingOverrides.HealthCheckProtocol;
      }

      if(healthCheckSettingOverrides.HealthCheckTimeoutSeconds) {
        this.logMessage(`Assigning HealthCheckTimeoutSeconds override value. [Value: ${healthCheckSettingOverrides.HealthCheckTimeoutSeconds}]`);
        params.HealthCheckTimeoutSeconds = healthCheckSettingOverrides.HealthCheckTimeoutSeconds;
      }

      if(healthCheckSettingOverrides.HealthyThresholdCount) {
        this.logMessage(`Assigning HealthyThresholdCount override value. [Value: ${healthCheckSettingOverrides.HealthyThresholdCount}]`);
        params.HealthyThresholdCount = healthCheckSettingOverrides.HealthyThresholdCount;
      }

      if(healthCheckSettingOverrides.Matcher) {
        this.logMessage(`Assigning Matcher override value. [Value: ${healthCheckSettingOverrides.Matcher}]`);
        params.Matcher = healthCheckSettingOverrides.Matcher;
      }

      if(healthCheckSettingOverrides.UnhealthyThresholdCount) {
        this.logMessage(`Assigning UnhealthyThresholdCount override value. [Value: ${healthCheckSettingOverrides.UnhealthyThresholdCount}]`);
        params.UnhealthyThresholdCount = healthCheckSettingOverrides.UnhealthyThresholdCount;
      }
    }


    this.logMessage(`Creating Target Group. [Name: ${name}]`);
    let createTargetGroupPromise = this._awsElbv2Client.createTargetGroup(params).promise();

    let targetGroupArn = '';
    return createTargetGroupPromise.then(result => {
      targetGroupArn = result.TargetGroups[0].TargetGroupArn;

      let tags = [
        { Key: 'Name', Value: name},
        { Key: 'Environment', Value: environment }
      ];

      return this._createTagsForTargetGroup(targetGroupArn, tags);
    }).then(() => {
      return targetGroupArn;
    });
  }

  /**
   *
   * @param loadBalancerArn (Required)
   * @param targetGroupArn (Required)
   * @param protocol (Required)  Possible Values: HTTP | HTTPS
   * @param port
   * @return {Promise<D>}
   */
  createListener(loadBalancerArn, targetGroupArn, protocol, port) {
    let params = {
      DefaultActions: [ /* required */
        {
          TargetGroupArn: targetGroupArn, /* required */
          Type: 'forward' /* required */
        }
      ],
      LoadBalancerArn: loadBalancerArn, /* required */
      Port: port, /* required */
      Protocol: protocol, /* required */
    };

    let createListenerPromise = this._awsElbv2Client.createListener(params).promise();

    return createListenerPromise;
  }


  /**
   *
   * @param targetGroupName
   * @return {Promise.<TResult>}
   */
  getTargetGroupArnFromName(targetGroupName) {
    let params = {
      Names: [ targetGroupName ]
    };

    let describeTargetGroupsPromise = this._awsElbv2Client.describeTargetGroups(params).promise();

    return describeTargetGroupsPromise.then(result => {
      if(result.TargetGroups && result.TargetGroups.length > 0) {
        return result.TargetGroups[0].TargetGroupArn;
      } else {
        return '';
      }
    });
  }

  getApplicationLoadBalancerArnFromName(loadBalancerName) {
    let params = {
      Names: [ loadBalancerName ]
    };

    let describeLoadBalancersPromise = this._awsElbv2Client.describeLoadBalancers(params).promise();

    return describeLoadBalancersPromise.then(result => {
      if(result.LoadBalancers && result.LoadBalancers.length > 0) {
        return result.LoadBalancers[0].LoadBalancerArn;
      } else {
        return '';
      }
    });
  }

  /**
   *
   * @param resourceId
   * @param tags Array of objects which contain a Key and Value key
   * @param addCreatedTag
   * @returns {Promise.<TResult>}
   * @private
   */
  _createTagsForElbV2(resourceId, tags, addCreatedTag = true) {

    if(addCreatedTag) {
      tags.push({ Key: 'Created', Value:  moment().format()});
    }

    //assign tags
    let createTagParams = {
      Resources: [ resourceId ],
      Tags: tags,
      DryRun: false
    };

    this.logMessage(`Assigning Tags to ResourceId. [ResourceId: ${resourceId}] [Tags: ${JSON.stringify(tags)}]`);
    return this._awsElbv2Client.createTags(createTagParams).promise();
  }

  _createTagsForTargetGroup(targetGroupArn, tags, addCreatedTag = true) {
    if(addCreatedTag) {
      tags.push({ Key: 'Created', Value:  moment().format()});
    }

    //assign tags
    let addTagParams = {
      ResourceArns: [ targetGroupArn ],
      Tags: tags
    };

    this.logMessage(`Assigning Tags to ResourceArns. [ResourceArn: ${targetGroupArn}] [Tags: ${JSON.stringify(tags)}]`);
    return this._awsElbv2Client.addTags(addTagParams).promise();
  }

  /**
   * Logs messages
   * @param msg
   */
  logMessage(msg) {
    console.log(msg);
  }
}


module.exports = ElbClient;