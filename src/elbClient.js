const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BlueBirdPromise);

class ElbClient extends BaseClient {

  get _awsElbv2Client() {
    if(!this._internalElbv2Client) {
      let params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2015-12-01',
        region: this._region
      };
      this._internalElbv2Client = new AWS.ELBv2(params);
    }

    return this._internalElbv2Client;
  }

  /**
   *
   * @param environment
   * @param appElbName
   * @param subnetIds
   * @param scheme
   * @param securityGroupIds
   * @return {Promise.<TResult>}
   */
  async createApplicationLoadBalancer(environment, appElbName, subnetIds, scheme, securityGroupIds) {

    try {
      const applicationLoadBalancerArn = await this.getApplicationLoadBalancerArnFromName(appElbName);

      if(!applicationLoadBalancerArn) {
        return await this._createApplicationLoadBalancer(environment, appElbName, subnetIds, scheme, securityGroupIds);
      } else {
        this.logMessage(`Application Load Balancer already exists. No action taken. [AppLoadBalancerName: ${appElbName}] [AppLoadBalancerArn: ${applicationLoadBalancerArn}]`);
      }
    } catch (err) {
      if (err.code === 'LoadBalancerNotFound') {
        this.logMessage(`Application Load Balancer does not exist. Creating TargetGroup. [AppLoadBalancerName: ${appElbName}]`);
        return await this._createApplicationLoadBalancer(environment, appElbName, subnetIds, scheme, securityGroupIds);
      }
    }
  }

  /**
   * Returns the created Application Load Balancer Arn
   * @param environment
   * @param appElbName
   * @param subnetIds
   * @param scheme Possible Values: 'internet-facing' | 'internal'
   * @param securityGroupIds
   */
  async _createApplicationLoadBalancer(environment, appElbName, subnetIds, scheme, securityGroupIds) {
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
    const albResult = await this._awsElbv2Client.createLoadBalancer(params).promise();

    if(albResult && albResult.LoadBalancers && albResult.LoadBalancers.length > 0) {
      return albResult.LoadBalancers[0].LoadBalancerArn;
    } else {
      return '';
    }
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
  async createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides = {}) {

    try {
      const targetGroupArn = await this.getTargetGroupArnFromName(name);

      if(!targetGroupArn) {
        this.logMessage(`TargetGroup does not exist.  Creating TargetGroup. [TargetGroupName: ${name}]`);
        return this._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);
      } else {
        this.logMessage(`TargetGroup already exist. No action taken. [TargetGroupName: ${name}] [TargetGroupArn: ${targetGroupArn}]`);
      }

    } catch (err) {
      if (err.code === 'TargetGroupNotFound') {
        this.logMessage(`TargetGroup does not exist.  Creating TargetGroup. [TargetGroupName: ${name}]`);
        return this._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);
      }
    }
  }

  /**
   *
   * @param environment
   * @param name
   * @param port
   * @param protocol
   * @param vpcId
   * @param healthCheckSettingOverrides
   * @return {*}
   * @private
   */
  async _createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides = {}) {

    try {
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

      if(protocol.toLocaleUpperCase() !== 'HTTP' && protocol.toLocaleUpperCase() !== 'HTTPS') {
        throw new Error(`Invalid protocol parameter value.  Value must be HTTP or HTTPs.  [Value: ${protocol}]`);
      }

      this.logMessage(`Creating Target Group. [Name: ${name}]`);
      const createTargetGroupResult = await this._awsElbv2Client.createTargetGroup(params).promise();

      let targetGroupArn = createTargetGroupResult.TargetGroups[0].TargetGroupArn;

      let tags = [
        { Key: 'Name', Value: name},
        { Key: 'Environment', Value: environment }
      ];

      await this._createTagsForTargetGroup(targetGroupArn, tags);
      return targetGroupArn;

    } catch (err) {
      this.logMessage(err.message);
    }
  }

  /**
   *
   * @param loadBalancerArn
   * @param targetGroupArn
   * @param protocol
   * @param port
   * @param certificates
   * @return {Promise.<TResult>}
   */
  async createListener(loadBalancerArn, targetGroupArn, protocol, port, certificates) {
    const listenerArn = await this.getListenerArn(loadBalancerArn, protocol, port);

    if(!listenerArn) {
      return await this._createListener(loadBalancerArn, targetGroupArn, protocol, port, certificates);
    } else {
      this.logMessage(`Listener already exist. No action taken. [LoadBalancerArn: ${loadBalancerArn}] [Protocol: ${protocol}] [Port: ${port}]`);
    }
  }

  /**
   *
   * @param loadBalancerArn (Required)
   * @param targetGroupArn (Required)
   * @param protocol (Required)  Possible Values: HTTP | HTTPS
   * @param port
   * @param certificates
   * @return {Promise}
   */
  async _createListener(loadBalancerArn, targetGroupArn, protocol, port, certificates) {
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

    if(!__.isEmpty(certificates)) {
      params.Certificates = certificates;
    }

    return await this._awsElbv2Client.createListener(params).promise();
  }


  /**
   *
   * @param targetGroupName
   * @return {Promise.<TResult>}
   */
  async getTargetGroupArnFromName(targetGroupName) {
    let params = {
      Names: [ targetGroupName ]
    };

    const targetGroupsResult = await this._awsElbv2Client.describeTargetGroups(params).promise();

    if(targetGroupsResult.TargetGroups && targetGroupsResult.TargetGroups.length > 0) {
      return targetGroupsResult.TargetGroups[0].TargetGroupArn;
    } else {
      return '';
    }
  }

  /**
   *
   * @param loadBalancerName
   * @return {Promise.<TResult>}
   */
  async getApplicationLoadBalancerArnFromName(loadBalancerName) {
    return await this._getApplicationLoadBalancerAttribute(loadBalancerName, 'LoadBalancerArn');
  }

  /**
   *
   * @param loadBalancerName
   * @return {Promise.<TResult>|*} Returns an object that contains the DNSName and CanonicalHostedZoneId of the Load Balancer
   */
  async getApplicationLoadBalancerDNSInfoFromName(loadBalancerName) {
    let params = {
      Names: [ loadBalancerName ]
    };

    this.logMessage(`Looking up DNS Info for Application Load Balancer. [Name: ${loadBalancerName}]`);
    const describeAlbsResult = await this._awsElbv2Client.describeLoadBalancers(params).promise();


    let returnObject = {
      DNSName: '',
      CanonicalHostedZoneId: ''
    };

    if(describeAlbsResult && describeAlbsResult.LoadBalancers && describeAlbsResult.LoadBalancers.length > 0) {
      this.logMessage(`Found Application Load Balancer with matching name. [Name: ${loadBalancerName}]`);
      returnObject.DNSName = describeAlbsResult.LoadBalancers[0].DNSName;
      returnObject.CanonicalHostedZoneId = describeAlbsResult.LoadBalancers[0].CanonicalHostedZoneId;
    } else {
      this.logMessage(`NOT FOUND - Application Load Balancer with matching name. [Name: ${loadBalancerName}] [Results: ${JSON.stringify(describeAlbsResult)}]`);
    }
    return returnObject;
  }

  /**
   *
   * @param loadBalancerName
   * @param attributeName
   * @return {Promise.<TResult>|*}
   * @private
   */
  async _getApplicationLoadBalancerAttribute(loadBalancerName, attributeName) {
    let params = {
      Names: [ loadBalancerName ]
    };

    const describeAlbsResult = await this._awsElbv2Client.describeLoadBalancers(params).promise();

    if(describeAlbsResult && describeAlbsResult.LoadBalancers && describeAlbsResult.LoadBalancers.length > 0) {
      return describeAlbsResult.LoadBalancers[0][attributeName];
    } else {
      return '';
    }
  }

  /**
   *
   * @param resourceId
   * @param tags Array of objects which contain a Key and Value key
   * @param addCreatedTag
   * @returns {Promise.<TResult>}
   * @private
   */
  async _createTagsForElbV2(resourceId, tags, addCreatedTag = true) {
    let localTags = tags;
    if(!__.isArray(localTags)) {
      localTags = [];
    }

    if(addCreatedTag) {
      localTags.push({ Key: 'Created', Value:  moment().format()});
    }

    //assign tags
    let createTagParams = {
      Resources: [ resourceId ],
      Tags: localTags,
      DryRun: false
    };

    this.logMessage(`Assigning Tags to ResourceId. [ResourceId: ${resourceId}] [Tags: ${JSON.stringify(localTags)}]`);
    return await this._awsElbv2Client.createTags(createTagParams).promise();
  }

  /**
   *
   * @param targetGroupArn
   * @param tags
   * @param addCreatedTag
   * @return {Promise<D>}
   * @private
   */
  async _createTagsForTargetGroup(targetGroupArn, tags, addCreatedTag = true) {

    let localTags = tags;
    if(!__.isArray(localTags)) {
      localTags = [];
    }

    if(addCreatedTag) {
      localTags.push({ Key: 'Created', Value:  moment().format()});
    }

    //assign tags
    let addTagParams = {
      ResourceArns: [ targetGroupArn ],
      Tags: localTags
    };

    this.logMessage(`Assigning Tags to ResourceArns. [ResourceArn: ${targetGroupArn}] [Tags: ${JSON.stringify(localTags)}]`);
    return await this._awsElbv2Client.addTags(addTagParams).promise();
  }

  /**
   *
   * @param applicationLoadBalancerArn
   * @param protocol
   * @param port
   * @return {Promise.<TResult>}
   */
  async getListenerArn(applicationLoadBalancerArn, protocol, port) {
    let params = {
      LoadBalancerArn: applicationLoadBalancerArn
    };

    this.logMessage(`Looking up ListenerArn by LoadBalancerArn, Protocol, and Port. [Arn: ${applicationLoadBalancerArn}] [Protocol: ${protocol}] [Port: ${port}]`);
    const listenersResult = await this._awsElbv2Client.describeListeners(params).promise();


    this.logMessage(`Looking up result for ListenerArn. [Results: ${JSON.stringify(listenersResult)}]`);
    let matchingEntry = __.filter(listenersResult.Listeners, { Port: port, Protocol: protocol });
    if(matchingEntry && matchingEntry.length > 0) {
      return matchingEntry[0].ListenerArn;
    }
    else {
      this.logMessage(`ListenerArn not found. [Arn: ${applicationLoadBalancerArn}] [Protocol: ${protocol}] [Port: ${port}]`);
      return '';
    }
  }
}

module.exports = ElbClient;
