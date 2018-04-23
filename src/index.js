const AWS = require('aws-sdk');
const BlueBirdPromise = require('bluebird');
AWS.config.setPromisesDependency(BlueBirdPromise);

const S3 = require('./s3Client');
const VPC = require('./vpcClient.js');
const ECS = require('./ecsClient.js');
const ELB = require('./elbClient.js');
const EC2 = require('./ec2Client.js');
const Lambda = require('./lambdaClient.js');
const AutoScaling = require('./autoScalingClient.js');
const Route53 = require('./route53Client.js');
const CloudFront = require('./cloudFrontClient.js');
const APIGateway = require('./apiGatewayClient');
const ApplicationAutoScaling = require('./applicationAutoScalingClient.js');
const CloudWatch = require('./cloudWatchClient.js');
const __ = require('lodash');
const util = require('util');
const moment = require('moment');
const path = require('path');
const BaseClient = require('./baseClient');



class Deployer extends BaseClient {

  /**
   *
   * @param options
   *  accessKey: <AWS Access Key Id>
   *  secretKey: <AWS Secret Access Key>
   *  region: <AWS Region>
   */
  constructor(options) {

    let opts = options || {};


    super(opts.accessKey, opts.secretKey, opts.region, opts.logLevel);
    this._accessKey = opts.accessKey;
    this._secretKey = opts.secretKey;
    this._region = opts.region;
    this._logLevel = opts.logLevel;
    this._s3Client = new S3(this._accessKey, this._secretKey, this._region, this._logLevel);
    this._vpcClient = new VPC(this._accessKey, this._secretKey, this._region, this._logLevel );
    this._ecsClient = new ECS(this._accessKey, this._secretKey, this._region, this._logLevel );
    this._ec2Client = new EC2(this._accessKey, this._secretKey, this._region, this._logLevel );
    this._elbClient = new ELB(this._accessKey, this._secretKey, this._region, this._logLevel );
    this._autoScalingClient = new AutoScaling(this._accessKey, this._secretKey, this._region, this._logLevel );
    this._route53Client = new Route53(this._accessKey, this._secretKey, this._region, this._logLevel );
    this._cloudFrontClient = new CloudFront(this._accessKey, this._secretKey, this._logLevel );
    this._apiGatewayClient = new APIGateway(this._accessKey, this._secretKey, this._region, this._logLevel );
    this._applicationAutoScalingClient = new ApplicationAutoScaling(this._accessKey, this._secretKey, this._region, this._logLevel );
    this._cloudWatchClient = new CloudWatch(this._accessKey, this._secretKey, this._region, this._logLevel );
    this._lambdaClient = new Lambda(this._accessKey, this._secretKey, this._region, this._logLevel );
  }


  /**
   *
   * @param {Object} config
   * @return {Promise<void>}
   */
  async createInfrastructure(config) {

    let vpcId = '';
    let launchConfigToDeleteName;

    //create Vpc
    await this._vpcClient.createVpcFromConfig(config.environment, config.vpc);

    //Create security groups
    for (let sgIndex = 0; sgIndex < config.securityGroups.length; sgIndex++) {
      let securityGroupConfig = config.securityGroups[sgIndex];
      await this._createSecurityGroup(config.environment, securityGroupConfig);
    }

    // Create file hosting buckets if they do not exist already
    await this.createS3BucketIfNecessary({name: config.s3.name, enableHosting: false});

    //Create Launch configuration
    const launchConfigNames = await this._createOrUpdateLaunchConfiguration(config.launchConfiguration, config.ecsClusterName);

    // Apply the launch configuration name that was actually used
    config.autoScaleGroup.launchConfigurationName = launchConfigNames.newLaunchConfigName;
    launchConfigToDeleteName = launchConfigNames.oldLaunchConfigName;

    //Create Target Group
    await this._createTargetGroup(config.environment, config.targetGroup);

    //Create Auto Scale Group
    await this._createOrUpdateAutoScaleGroup(config.environment, config.autoScaleGroup, launchConfigToDeleteName);

    //Create Application Load Balancer
    await this._createApplicationLoadBalancer(config.environment, config.appLoadBalancer);

    //Create Listener (Application LB to Target Group Association)
    await this._createApplicationLoadBalancerListener(config.appListener);

    //associate Load balancer with DNS Entry
    await this._createDNSEntryForApplicationLoadBalancer(config.environment, config.appLoadBalancer.name, config.dnsHostname, config.healthCheckResourcePath);

    //Create ECS Cluster

    await this._ecsClient.createCluster(config.ecsClusterName);
    console.log('Infrastructure Deployed');
  }


  async deploy(serviceConfig, taskDefintionConfig) {
    await this._ecsClient.registerTaskDefinition(taskDefintionConfig.taskName, taskDefintionConfig.networkMode, taskDefintionConfig.taskRoleArn, taskDefintionConfig.containerDefintions);
    return await this._createECSService(serviceConfig);
  }


  async lookupApiGatewayByName(name) {
    return await this._apiGatewayClient.lookupApiGatewayByName(name);
  }

  /**
   * Looks up an API Gateway URL using the apiName and the StageName
   * @param {string} apiName
   * @param {string} stageName
   * @return {Promise.<D>}
   */
  async lookupApiGatewayURL(apiName, stageName) {
    return await this._apiGatewayClient.lookupApiGatewayURL(apiName, stageName);
  }

  /**
   * Looks up an API Gateway Domain Name
   * @param {string} apiName
   * @return {Promise.<D>}
   */
  async lookupApiGatewayDomainName(apiName) {
    return await this._apiGatewayClient.lookupApiGatewayDomainName(apiName);
  }


  /**
   * This will do the following: 1. lookup api by swagger title, 2. delay 3a. if api not found create the new api, 3b. if api found it will update it 4. delay again
   * @param {Object} swaggerEntity Note: swaggerEntity must have valid info.title. Pulling from here because the is the aws importer strategy
   * @param {number} [delayInMilliseconds=16000] this defaults to 16 seconds
   * @param {boolean} [failOnWarnings=false]
   * @return {Promise<Object>|Promise<gulpUtil.PluginError>}
   */
  async createOrOverwriteApiSwagger(swaggerEntity, delayInMilliseconds = 16000, failOnWarnings = false) {
    return await this._apiGatewayClient.createOrOverwriteApiSwagger(swaggerEntity,delayInMilliseconds,failOnWarnings);
  }


  /**
   * Creates a CloudFront Client and associates it to a hosted zone
   * @param cloudfrontConfig
   * @return {Promise}
   */
  async createCloudfront(cloudFrontConfig) {
    const cname = cloudFrontConfig.cname;
    const distribution = await this._cloudFrontClient.createOrUpdateCloudFrontDistribution(cloudFrontConfig);
    return await this._route53Client.associateDomainWithCloudFront(cname, distribution.DomainName);
  }


  /**
   * Creates an S3 bucket if needed
   * @param config
   * @return {Promise}
   */
  async createS3BucketIfNecessary(config) {
    return await this._s3Client.createBucketIfNecessary(config);
  }


  /**
   * Creates a CloudFront Client and associates it to a hosted zone
   * @param config
   * @param config.name
   * @return {Promise.<D>}
   */
  async publishChangesToBucket(config) {
    return await this._s3Client.publishToBucket(config);
  }


  /**
   *
   * @param restApiId
   * @param stageName
   * @param variableCollection
   * @returns {Promise.<*>}
   */
  async createDeployment(restApiId, stageName, variableCollection, loggingParams) {
    return await this._apiGatewayClient.createDeployment(restApiId, stageName, variableCollection, loggingParams);
  }


  /**
   *
   * @param entity
   * @return {string}
   */
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
  async _createSecurityGroup(environment, securityGroupConfig) {
    //convert vpcName to vpcId
    this.logMessage(`Creating Security Group. [Config: ${JSON.stringify(securityGroupConfig)}]`);
    const vpcId = await this._vpcClient.getVpcIdFromName(securityGroupConfig.vpcName);

    //add vpcId
    securityGroupConfig.vpcId = vpcId;

    return await this._ec2Client.createSecurityGroupFromConfig(environment, securityGroupConfig);
  }


  /**
   *
   * @param launchConfigurationConfig
   * @param {string} ecsClusterName
   * @return {PromiseLike<T>}
   * @public
   */
  async _createOrUpdateLaunchConfiguration(launchConfigurationConfig, ecsClusterName) {
    //convert vpcName to vpcId
    const vpcId = await this._vpcClient.getVpcIdFromName(launchConfigurationConfig.vpcName);
    const securityGroupId = await this._ec2Client.getSecurityGroupIdFromName(launchConfigurationConfig.securityGroupName, vpcId);

    launchConfigurationConfig.ecsClusterName = ecsClusterName;
    launchConfigurationConfig.securityGroupId = securityGroupId;

    return await this._autoScalingClient.createOrUpdateLaunchConfigurationFromConfig(launchConfigurationConfig);
  }


  /**
   *
   * @param environment
   * @param targetGroupConfig
   * @return {* | PromiseLike<T> | Promise<T>}
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
   * @param {string} environment
   * @param asgConfig
   * @param launchConfigToDeleteName
   */
  async _createOrUpdateAutoScaleGroup(environment, asgConfig, launchConfigToDeleteName) {

    const vpcId = await this._vpcClient.getVpcIdFromName(asgConfig.vpcName);
    const subnetIds = await this._vpcClient.getSubnetIdsFromSubnetName(vpcId, asgConfig.vpcSubnets);
    const targetGroupArn = await this._elbClient.getTargetGroupArnFromName(asgConfig.targetGroupName);

    let subnetIdsAsString = subnetIds.join(',');

    let params = {
      environment,
      name: asgConfig.name,
      launchConfigurationName: asgConfig.launchConfigurationName,
      minSize: asgConfig.minSize,
      maxSize: asgConfig.maxSize,
      desiredCapacity: asgConfig.desiredSize,
      targetGroupArns: [targetGroupArn],
      vpcSubnets: subnetIdsAsString
    };

    return await this._autoScalingClient.createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName);
  }


  /**
   *
   * @param environment
   * @param appLoadBalancerConfig
   * @private
   */
  async _createApplicationLoadBalancer(environment, appLoadBalancerConfig) {
    const vpcId = await this._vpcClient.getVpcIdFromName(appLoadBalancerConfig.vpcName);
    const subnetIds = await this._vpcClient.getSubnetIdsFromSubnetName(vpcId, appLoadBalancerConfig.vpcSubnets);
    const securityGroupId = await this._ec2Client.getSecurityGroupIdFromName(appLoadBalancerConfig.securityGroupName, vpcId);

    return await this._elbClient.createApplicationLoadBalancer(environment, appLoadBalancerConfig.name, subnetIds, appLoadBalancerConfig.scheme, [securityGroupId]);
  }


  /**
   *
   * @param listenerConfig
   * @return {Function|*}
   * @private
   */
  async _createApplicationLoadBalancerListener(listenerConfig) {
    let listenerConfigs = listenerConfig;
    if(!__.isArray(listenerConfigs)) {
      listenerConfigs = [listenerConfig];
    }

    //create promise function
    let createPromiseForListenerConfigCreation = async (listenerConfigObject) => {

      //convert certificateArn to an array
      let certificateArnArray = [];
      if(listenerConfigObject.certificateArn) {
        certificateArnArray = [
          {
            CertificateArn: listenerConfigObject.certificateArn
          }
        ];
      }

      const loadBalancerArn = await this._elbClient.getApplicationLoadBalancerArnFromName(listenerConfigObject.loadBalancerName);
      const targetGroupArn = await this._elbClient.getTargetGroupArnFromName(listenerConfigObject.targetGroupName);
      return await this._elbClient.createListener(loadBalancerArn, targetGroupArn, listenerConfigObject.protocol, listenerConfigObject.port, certificateArnArray);
    };

    let promiseArray = [];

    for (let configIndex = 0; configIndex < listenerConfigs.length; configIndex++) {
      let listenerConfigObject = listenerConfigs[configIndex];

      let newPromise = createPromiseForListenerConfigCreation(listenerConfigObject);

      promiseArray.push(newPromise);
    }

    return await BlueBirdPromise.all(promiseArray);
  }


  /**
   *
   * @param serviceConfig
   * @returns {Promise<{}>}
   * @private
   */
  async _createECSService(serviceConfig) {

    const targetGroupArn = await this._elbClient.getTargetGroupArnFromName(serviceConfig.targetGroupName);
    await this._ecsClient.createOrUpdateService(serviceConfig.clusterName, serviceConfig.serviceName, serviceConfig.taskName, serviceConfig.desiredCount, serviceConfig.containerName, serviceConfig.containerPort, targetGroupArn);

    await this._applicationAutoScalingClient.registerScalableTarget(serviceConfig.registerScalableTargetParams);
    const scaleOutResponse = await this._applicationAutoScalingClient.putScalingPolicy(serviceConfig.serviceScaleOutPolicyParams);
    serviceConfig.putAlarmScaleOutParams.AlarmActions[0] = scaleOutResponse.PolicyARN;
    await this._cloudWatchClient.putMetricAlarm(serviceConfig.putAlarmScaleOutParams);
    const scaleInResponse = await this._applicationAutoScalingClient.putScalingPolicy(serviceConfig.serviceScaleInPolicyParams);
    serviceConfig.putAlarmScaleInParams.AlarmActions[0] = scaleInResponse.PolicyARN;

    await this._cloudWatchClient.putMetricAlarm(serviceConfig.putAlarmScaleInParams);

    //
  }

  /**
   *
   * @param environment
   * @param applicationLoadBalancerName
   * @param dnsHostname
   * @private
   * @return {Promise<TResult>}
   */
  async _createDNSEntryForApplicationLoadBalancer(environment, applicationLoadBalancerName, dnsHostname, healthCheckResourcePath) {

    const dnsInfo = await this._elbClient.getApplicationLoadBalancerDNSInfoFromName(applicationLoadBalancerName);
    return await this._route53Client.associateDomainWithApplicationLoadBalancer(dnsHostname, dnsInfo.DNSName, dnsInfo.CanonicalHostedZoneId, healthCheckResourcePath);
  }

  /**
   *
   * @param {Object} deploymentParams
   * @param {string} deploymentParams.environment
   * @param {Object} lambdaConfig
   * @param {string} lambdaConfig.zipFileName
   * @param {string} lambdaConfig.region
   * @param {string} lambdaConfig.handler
   * @param {string} lambdaConfig.role
   * @param {string} lambdaConfig.functionName
   * @param {Number} lambdaConfig.timeout This is a value in seconds
   * @param {Number} lambdaConfig.memorySize 128 | 192 | 256 | .... | 1024 | 2048
   * @param {Boolean} lambdaConfig.publish
   * @param {string} lambdaConfig.runtime
   * @param {string} [lambdaConfig.logging.Principal]
   * @param {string} [lambdaConfig.logging.LambdaFunctionName]
   * @param {string} [lambdaConfig.logging.Arn]
   * @param {Object} [lambdaConfig.schedule]
   * @param {string} [lambdaConfig.schedule.ruleName]
   * @param {string} [lambdaConfig.schedule.ruleDescription]
   * @param {string} [lambdaConfig.schedule.ruleScheduleExpression]
   * @param {Array} [lambdaConfig.environments]
   * @param {string} [lambdaConfig.environments[].name]
   * @param {Object} [lambdaConfig.environments[].variables]
   */
  deployLambda(lambdaConfig) {
    const ALLOWED_ENVIRONMENTS = {dev: 'dev', demo: 'demo', prod:'prod'};
    if (!__.has(lambdaConfig, 'zipFileName')) {
      this.logError('lambdaConfig must have field \'zipFileName\'');
      throw new Error('lambdaConfig must have field \'zipFileName\'');
    }

    if (!__.has(lambdaConfig, 'environments')) {
      return this._lambdaClient.deployLambdaFunction({}, lambdaConfig);

    } else {
      const envLambdas = [];

      const environments = lambdaConfig.environments;
      delete lambdaConfig.environments;

      let currentEnvironment;
      for(let envIndex = 0, envLength = environments.length; envIndex < envLength; ++envIndex) {
        currentEnvironment = environments[envIndex];

        if(!(currentEnvironment.name in ALLOWED_ENVIRONMENTS)) {
          this.logMessage(`Invalid Lambda environment, skipping entry. [Environment: ${currentEnvironment.name}] [Allowed Environments: ${JSON.stringify(Object.keys(ALLOWED_ENVIRONMENTS))}]`);
          continue;
        }

        let currentDeploymentParams = {
          environmentName: currentEnvironment.name,
          variables: currentEnvironment.variables
        };

        envLambdas.push(this._lambdaClient.deployLambdaFunction(currentDeploymentParams, lambdaConfig));
      }

      return Promise.all(envLambdas);
    }
  }
}

module.exports = function() {
  return Deployer;
}();
