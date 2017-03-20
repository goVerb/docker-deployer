const VPC = require('./vpcClient.js');
const ECS = require('./ecsClient.js');
const ELB = require('./elbClient.js');
const EC2 = require('./ec2Client.js');
const AutoScaling = require('./autoScalingClient.js');
const Route53 = require('./route53Client.js');
const CloudFront = require('./cloudFrontClient.js');
const APIGateway = require('./apiGatewayClient');
const ApplicationAutoScaling = require('./applicationAutoScalingClient.js');
const CloudWatch = require('./cloudWatchClient.js');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
let util = require('util');
let moment = require('moment');



class Deployer {

  /**
   *
   * @param options
   *  accessKey: <AWS Access Key Id>
   *  secretKey: <AWS Secret Access Key>
   *  region: <AWS Region>
   */
  constructor(options) {

    let opts = options || {};


    this._accessKey = opts.accessKey;
    this._secretKey = opts.secretKey;
    this._region = opts.region;

    this._vpcClient = new VPC(this._accessKey, this._secretKey, this._region);
    this._ecsClient = new ECS(this._accessKey, this._secretKey, this._region);
    this._ec2Client = new EC2(this._accessKey, this._secretKey, this._region);
    this._elbClient = new ELB(this._accessKey, this._secretKey, this._region);
    this._autoScalingClient = new AutoScaling(this._accessKey, this._secretKey, this._region);
    this._route53Client = new Route53(this._accessKey, this._secretKey, this._region);
    this._cloudFrontClient = new CloudFront(this._accessKey, this._secretKey);
    this._apiGatewayClient = new APIGateway(this._accessKey, this._secretKey, this._region);
    this._applicationAutoScalingClient = new ApplicationAutoScaling(this._accessKey, this._secretKey, this._region);
    this._cloudWatchClient = new CloudWatch(this._accessKey, this._secretKey, this._region);
  }


  createInfrastructure(config) {

    let vpcId = '';

    //create Vpc
    return this._vpcClient.createVpcFromConfig(config.environment, config.vpc).then(createdVpcId => {
      vpcId = createdVpcId;
    }).then(() => {
      //Create security groups

      let securityGroupPromises = [];
      for (let sgIndex = 0; sgIndex < config.securityGroups.length; sgIndex++) {
        let securityGroupConfig = config.securityGroups[sgIndex];
        securityGroupPromises.push(this._createSecurityGroup(config.environment, securityGroupConfig));
      }

      return BlueBirdPromise.all(securityGroupPromises);
    }).then(() => {
      //Create Launch configuration
      return this._createLaunchConfiguration(config.launchConfiguration, config.ecsClusterName);
    }).then(() => {
      //Create Target Group
      return this._createTargetGroup(config.environment, config.targetGroup);
    }).then(() => {
      //Create Auto Scale Group
      return this._createAutoScaleGroup(config.environment, config.autoScaleGroup);
    }).then(() => {
      //Create Application Load Balancer
      return this._createApplicationLoadBalancer(config.environment, config.appLoadBalancer);
    }).then(() => {
      //Create Listener (Application LB to Target Group Association)

      return this._createApplicationLoadBalancerListener(config.appListener);
    }).then(() => {
      //associate Load balancer with DNS Entry
      return this._createDNSEntryForApplicationLoadBalancer(config.environment, config.appLoadBalancer.name, config.dnsHostname);
    }).then(() => {
      //Create ECS Cluster

      return this._ecsClient.createCluster(config.ecsClusterName);
    }).then(() => {
      console.log('Infrastructure Deployed');
    });
  }

  deploy(serviceConfig, taskDefintionConfig) {
    return this._ecsClient.registerTaskDefinition(taskDefintionConfig.taskName, taskDefintionConfig.networkMode, taskDefintionConfig.taskRoleArn, taskDefintionConfig.containerDefintions).then(() => {
      return this._createECSService(serviceConfig);
    });

  }

  lookupApiGatewayByName(name) {
    return this._apiGatewayClient.lookupApiGatewayByName(name);
  }

  logMessage(msg) {
    console.log(`[${moment().format()}] ${msg}`);
  }
  /**
   * Looks up an API Gateway URL using the apiName and the StageName
   * @param apiName
   * @param StageName
   * @return {Promise.<D>}
   */
  lookupApiGatewayURL(apiName, stageName) {
    return this._apiGatewayClient.lookupApiGatewayURL(apiName, stageName);
  }

  /**
   * Looks up an API Gateway Domain Name
   * @param apiName
   * @return {Promise.<D>}
   */
  lookupApiGatewayDomainName(apiName) {
    return this._apiGatewayClient.lookupApiGatewayDomainName(apiName);
  }
  /**
   * This will do the following: 1. lookup api by swagger title, 2. delay 3a. if api not found create the new api, 3b. if api found it will update it 4. delay again
   * @param {Object} swaggerEntity Note: swaggerEntity must have valid info.title. Pulling from here because the is the aws importer strategy
   * @param {number} [delayInMilliseconds=16000] this defaults to 16 seconds
   * @param {boolean} [failOnWarnings=false]
   * @return {Promise<Object>|Promise<gulpUtil.PluginError>}
   */
   createOrOverwriteApiSwagger(swaggerEntity, delayInMilliseconds = 16000, failOnWarnings = false) {
     return this._apiGatewayClient.createOrOverwriteApiSwagger(swaggerEntity,delayInMilliseconds,failOnWarnings);
   }
  /**
   * Creates a CloudFront Client and associates it to a hosted zone
   * @param cloudfrontConfig
   * @return {Promise.<D>}
   */
  createCloudfront(cloudFrontConfig) {
    const cname = cloudFrontConfig.cname;
    return this._cloudFrontClient.createOrUpdateCloudFrontDistribution(cloudFrontConfig).then(distribution => {
      return this._route53Client.associateDomainWithCloudFront(cname, distribution.DomainName);
    });
  }
  /**
   *
   * @param restApiId
   * @param stageName
   * @param variableCollection
   * @returns {Promise.<*>}
   */
  createDeployment(restApiId, stageName, variableCollection) {
    return this._apiGatewayClient.createDeployment(restApiId, stageName, variableCollection);
  }

  getObjectAsString(entity) {
    return util.isNullOrUndefined(entity) ? '' : JSON.stringify(entity);
  }
  /**
   * Looks up the various resources before pushing the config object to the client to be created
   * @param environment
   * @param securityGroupConfig
   * @return {Promise.<TResult>}
   * @private
   */
  _createSecurityGroup(environment, securityGroupConfig) {

    //convert vpcName to vpcId
    return this._vpcClient.getVpcIdFromName(securityGroupConfig.vpcName)
      .then(vpcId => {
        //add vpcId
        securityGroupConfig.vpcId = vpcId;

        return this._ec2Client.createSecurityGroupFromConfig(environment, securityGroupConfig);
      });
  }

  /**
   *
   * @param launchConfigurationConfig
   * @param ecsClusterName
   * @return {Promise.<TResult>}
   * @private
   */
  _createLaunchConfiguration(launchConfigurationConfig, ecsClusterName) {
    //convert vpcName to vpcId
    return this._vpcClient.getVpcIdFromName(launchConfigurationConfig.vpcName).then(vpcId => {
      return this._ec2Client.getSecurityGroupIdFromName(launchConfigurationConfig.securityGroupName, vpcId);
    }).then(securityGroupId => {
      launchConfigurationConfig.ecsClusterName = ecsClusterName;
      launchConfigurationConfig.securityGroupId = securityGroupId;

      return this._autoScalingClient.createLaunchConfigurationFromConfig(launchConfigurationConfig);
    });
  }

  /**
   *
   * @param environment
   * @param targetGroupConfig
   * @return {Promise.<TResult>}
   * @private
   */
  _createTargetGroup(environment, targetGroupConfig) {
    //convert vpcName to vpcId
    return this._vpcClient.getVpcIdFromName(targetGroupConfig.vpcName).then(vpcId => {
      return this._elbClient.createTargetGroup(environment, targetGroupConfig.name, targetGroupConfig.port, targetGroupConfig.protocol, vpcId, {
        HealthCheckPath: '/health'
      });
    });
  }

  /**
   *
   * @param environment
   * @param asgConfig
   * @private
   */
  _createAutoScaleGroup(environment, asgConfig) {

    return this._vpcClient.getVpcIdFromName(asgConfig.vpcName).then(vpcId => {

      return BlueBirdPromise.all([
        this._vpcClient.getSubnetIdsFromSubnetName(vpcId, asgConfig.vpcSubnets),
        this._elbClient.getTargetGroupArnFromName(asgConfig.targetGroupName)
      ]);
    }).spread((subnetIds, targetGroupArn) => {

      let subnetIdsAsString = subnetIds.join(',');

      return this._autoScalingClient.createAutoScalingGroup(environment, asgConfig.name, asgConfig.launchConfigurationName, asgConfig.minSize, asgConfig.maxSize, asgConfig.desiredSize, [targetGroupArn], subnetIdsAsString);
    });
  }

  /**
   *
   * @param environment
   * @param appLoadBalancerConfig
   * @private
   */
  _createApplicationLoadBalancer(environment, appLoadBalancerConfig) {

    return this._vpcClient.getVpcIdFromName(appLoadBalancerConfig.vpcName).then(vpcId => {
      return BlueBirdPromise.all([
        this._vpcClient.getSubnetIdsFromSubnetName(vpcId, appLoadBalancerConfig.vpcSubnets),
        this._ec2Client.getSecurityGroupIdFromName(appLoadBalancerConfig.securityGroupName, vpcId)
      ]);
    }).spread((subnetIds, securityGroupId) => {
      return this._elbClient.createApplicationLoadBalancer(environment, appLoadBalancerConfig.name, subnetIds, appLoadBalancerConfig.scheme, [securityGroupId]);
    });

  }

  /**
   *
   * @param listenerConfig
   * @return {Function|*}
   * @private
   */
  _createApplicationLoadBalancerListener(listenerConfig) {

    let listenerConfigs = listenerConfig;
    if(!__.isArray(listenerConfigs)) {
      listenerConfigs = [listenerConfig];
    }

    //create promise function
    let createPromiseForListenerConfigCreation = (listenerConfigObject) => {

      //convert certificateArn to an array
      let certificateArnArray = [];
      if(listenerConfigObject.certificateArn) {
        certificateArnArray = [
          {
            CertificateArn: listenerConfigObject.certificateArn
          }
        ];
      }

      return BlueBirdPromise.all([
        this._elbClient.getApplicationLoadBalancerArnFromName(listenerConfigObject.loadBalancerName),
        this._elbClient.getTargetGroupArnFromName(listenerConfigObject.targetGroupName)
      ]).spread((loadBalancerArn, targetGroupArn) => {
        return this._elbClient.createListener(loadBalancerArn, targetGroupArn, listenerConfigObject.protocol, listenerConfigObject.port, certificateArnArray);
      });
    };

    let promiseArray = [];

    for (let configIndex = 0; configIndex < listenerConfigs.length; configIndex++) {
      let listenerConfigObject = listenerConfigs[configIndex];

      let newPromise = createPromiseForListenerConfigCreation(listenerConfigObject);

      promiseArray.push(newPromise);
    }



    return BlueBirdPromise.all(promiseArray);
  }

  /**
   *
   * @param serviceConfig
   * @return {Promise.<TResult>}
   * @private
   */
  _createECSService(serviceConfig) {

    return this._elbClient.getTargetGroupArnFromName(serviceConfig.targetGroupName).then(targetGroupArn => {
      return this._ecsClient.createOrUpdateService(serviceConfig.clusterName, serviceConfig.serviceName, serviceConfig.taskName, serviceConfig.desiredCount, serviceConfig.containerName, serviceConfig.containerPort, targetGroupArn);
    }).then(() => {
      return this._applicationAutoScalingClient.registerScalableTarget(serviceConfig.registerScalableTargetParams);
    }).then(() => {
      return this._applicationAutoScalingClient.putScalingPolicy(serviceConfig.serviceScaleOutPolicyParams);
    }).then(resp => {
      serviceConfig.putAlarmScaleOutParams.AlarmActions[0] = resp.PolicyARN;
      return this._cloudWatchClient.putMetricAlarm(serviceConfig.putAlarmScaleOutParams);
    }).then(() => {
      return this._applicationAutoScalingClient.putScalingPolicy(serviceConfig.serviceScaleInPolicyParams);
    }).then(resp => {
      serviceConfig.putAlarmScaleInParams.AlarmActions[0] = resp.PolicyARN;
      return this._cloudWatchClient.putMetricAlarm(serviceConfig.putAlarmScaleInParams);
    })
  }

  /**
   *
   * @param environment
   * @param applicationLoadBalancerName
   * @param dnsHostname
   * @private
   */
  _createDNSEntryForApplicationLoadBalancer(environment, applicationLoadBalancerName, dnsHostname) {

    return this._elbClient.getApplicationLoadBalancerDNSInfoFromName(applicationLoadBalancerName).then(dnsInfo => {
      return this._route53Client.associateDomainWithApplicationLoadBalancer(dnsHostname, dnsInfo.DNSName, dnsInfo.CanonicalHostedZoneId);
    });
  }
}

module.exports = function() {
  return Deployer;
}();
