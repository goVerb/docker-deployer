const VPC = require('./vpcClient.js');
const ECS = require('./ecsClient.js');
const ELB = require('./elbClient.js');
const EC2 = require('./ec2Client.js');
const AutoScaling = require('./autoScalingClient.js');
const BlueBirdPromise = require('bluebird');





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


    this._accessKey = opts.accessKey || '';
    this._secretKey = opts.secretKey || '';
    this._region = opts.region || '';

    this._vpcClient = new VPC(this._accessKey, this._secretKey, this._region);
    this._ecsClient = new ECS(this._accessKey, this._secretKey, this._region);
    this._ec2Client = new EC2(this._accessKey, this._secretKey, this._region);
    this._elbClient = new ELB(this._accessKey, this._secretKey, this._region);
    this._autoScalingClient = new AutoScaling(this._accessKey, this._secretKey, this._region);
  }


  createInfrastructure(config) {

    let vpcId = '';

    //create Vpc
    return this._vpcClient.createVpcFromConfig(config.environment, config.vpc).then(createdVpcId => {
      vpcId = createdVpcId;
    }).then(() => {
      //Create security groups

      let securityGroupPromises = [];
      for(let sgIndex = 0; sgIndex < config.securityGroups.length; sgIndex++) {
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
      return this._elbClient.createTargetGroup(environment, targetGroupConfig.name, targetGroupConfig.port, targetGroupConfig.protocol, vpcId, {HealthCheckPath: '/health'});
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

    return BlueBirdPromise.all([
      this._elbClient.getApplicationLoadBalancerArnFromName(listenerConfig.loadBalancerName),
      this._elbClient.getTargetGroupArnFromName(listenerConfig.targetGroupName)
    ]).spread((loadBalancerArn, targetGroupArn) => {
      return this._elbClient.createListener(loadBalancerArn, targetGroupArn, listenerConfig.protocol, listenerConfig.port);
    });

  }

  _createECSService(serviceConfig) {

    return this._elbClient.getTargetGroupArnFromName(serviceConfig.targetGroupName).then(targetGroupArn => {

      return this._ecsClient.createOrUpdateService(serviceConfig.clusterName, serviceConfig.serviceName, serviceConfig.taskName, serviceConfig.desiredCount, serviceConfig.containerName, serviceConfig.containerPort, targetGroupArn);
    });
  }
}


module.exports = function() {
  return Deployer;
}();
