const VPC = require('./vpcClient.js');
const ECS = require('./ecsClient.js');
const ELB = require('./elbClient.js');
const EC2 = require('./ec2Client.js');
const AutoScaling = require('./autoScalingClient.js');
const BlueBirdPromise = require('bluebird');



let vpcDefinition = {
  name: '***REMOVED*** VPC',
  cidrBlock: '10.0.0.0/16',
  subnets: [
    { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 'us-west-2a', networkAclName: 'Instance Network Acl'},
    { name: 'Instance Subnet 2', cidrBlock: '10.0.4.0/24', availabilityZone: 'us-west-2b', networkAclName: 'Instance Network Acl'}
  ],
  networkAcls: [
    {
      name: 'Instance Network Acl',
      rules: [
        { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
        { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
      ]
    }
  ]
};

let elbSecurityGroupDefinition = {
  name: '***REMOVED*** ALB SG',
  description: 'Applied to the application load balancer for the ***REMOVED*** ECS Cluster.',
  vpcName: vpcDefinition.name,
  rules: [
    {egress: false, protocol: '-1', fromPort: 0, toPort: 65535, allowedIpCidrBlock: '0.0.0.0/0'}
  ]
};

let ec2SecurityGroupDefinition = {
  name: '***REMOVED*** EC2 SG',
  description: 'Applied to the EC2 instances for the ***REMOVED*** ECS Cluster.',
  vpcName: vpcDefinition.name,
  rules: [
    {egress: false, protocol: 'tcp', fromPort: 32768, toPort: 51677, allowedSecurityGroupName: elbSecurityGroupDefinition.name},
    {egress: false, protocol: 'tcp', fromPort: 51680, toPort: 61000, allowedSecurityGroupName: elbSecurityGroupDefinition.name},
    {egress: false, protocol: 'tcp', fromPort: 2375, toPort: 2376, allowedIpCidrBlock: '0.0.0.0/0'},
    {egress: false, protocol: 'tcp', fromPort: 51678, toPort: 51679, allowedIpCidrBlock: '0.0.0.0/0', }
  ]
};

let launchConfigurationDefinition = {
  name: '***REMOVED*** ECS LC',
  baseImageId: 'ami-7abc111a',
  vpcName: vpcDefinition.name,
  securityGroupName: ec2SecurityGroupDefinition.name,
  instanceType: 't2.micro',
};

let targetGroupDefinition = {
  name: '***REMOVED***-Target-Group',
  port: 80,
  protocol: 'HTTP',
  vpcName: vpcDefinition.name,
  healthCheckSettingOverrides: {
    HealthCheckPath: '/health'
  }
};

let applicationLoadBalancerDefinition = {
  name: '***REMOVED***-ECS-App-Load-Balancer',
  scheme: 'internet-facing',
  securityGroupName: elbSecurityGroupDefinition.name,
  vpcName: vpcDefinition.name,
  vpcSubnets: ['Instance Subnet 1', 'Instance Subnet 2']
};

let infrastructureDefinition = {
  environment: 'Dev',
  ecsClusterName: '***REMOVED***-Cluster',
  vpc: vpcDefinition,
  securityGroups: [elbSecurityGroupDefinition, ec2SecurityGroupDefinition],
  launchConfiguration: launchConfigurationDefinition,
  targetGroup: targetGroupDefinition,
  autoScaleGroup: {
    name: '***REMOVED***-ECS-ASG',
    launchConfigurationName: launchConfigurationDefinition.name,
    minSize: 1,
    maxSize: 3,
    desiredSize: 2,
    targetGroupName: targetGroupDefinition.name,
    vpcName: vpcDefinition.name,
    vpcSubnets: ['Instance Subnet 1', 'Instance Subnet 2']
  },
  appLoadBalancer: applicationLoadBalancerDefinition,
  appListener: {
    loadBalancerName: applicationLoadBalancerDefinition.name,
    targetGroupName: targetGroupDefinition.name,
    protocol: 'HTTP',
    port: 80
  }
};

class Deployer {

  constructor(region) {
    this._vpcClient = new VPC(region);
    this._ecsClient = new ECS(region);
    this._ec2Client = new EC2(region);
    this._elbClient = new ELB(region);
    this._autoScalingClient = new AutoScaling(region);
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

  deploy(serviceConfig, taskConfig) {
    // then(() => {
    //   //CreateOrUpdate Task Definition
    // }).then(() => {
    //   //CreateOrUpdate Service
    // });

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
      return this._autoScalingClient.createLaunchConfiguration(launchConfigurationConfig.name, launchConfigurationConfig.baseImageId, securityGroupId, launchConfigurationConfig.instanceType, null, ecsClusterName);
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
}

//VPC Creation


 let vpcClient = new VPC();



// vpcClient.createVpcFromConfig(vpcConfig);




let ec2Client = new EC2();

// let elbSecurityGroupConfig = {
//   name: 'Richard Test',
//   description: 'does this work',
//   environment: '***REMOVED***-Dev',
//   vpcId: 'vpc-fc14d59b',
//   rules: [
//     {egress: false, protocol: '-1', fromPort: 0, toPort: 65535, allowedIpCidrBlock: '0.0.0.0/0'},
//     {egress: true, protocol: '-1', fromPort: 0, toPort: 65535, allowedIpCidrBlock: '0.0.0.0/0'}
//   ]
// };

// ec2Client.createSecurityGroupFromConfig(securityGroupConfig).then(result => {
//   console.log(`Security group created. [Result: ${result}]`);
// });

// let ec2SecurityGroupConfig = {
//   name: 'Richard EC2 Test',
//   description: 'does this work',
//   environment: '***REMOVED***-Dev',
//   vpcId: 'vpc-fc14d59b',
//   rules: [
//     {egress: false, protocol: 'tcp', fromPort: 32768, toPort: 51677, allowedSecurityGroupId: 'sg-61caed18'},
//     {egress: false, protocol: 'tcp', fromPort: 51680, toPort: 61000, allowedSecurityGroupId: 'sg-61caed18'},
//     {egress: false, protocol: 'tcp', fromPort: 2375, toPort: 2376, allowedIpCidrBlock: '0.0.0.0/0'},
//     {egress: false, protocol: 'tcp', fromPort: 51678, toPort: 51679, allowedIpCidrBlock: '0.0.0.0/0', }
//   ]
// };
//
// ec2Client.createSecurityGroupFromConfig(ec2SecurityGroupConfig).then(result => {
//   console.log(`Security group created. [Result: ${result}]`);
// });


let elbClient = new ELB();


//Create ELB
// BlueBirdPromise.all([
//   vpcClient.getSubnetIdsFromSubnetName('vpc-fc14d59b', ['Instance Subnet 1', 'Instance Subnet 2']),
//   ec2Client.getSecurityGroupIdFromName('Richard Test')
// ]).spread((subnetIds, securityGroupId) => {
//   return elbClient.createApplicationLoadBalancer('***REMOVED***-Dev', 'Richard-Test-App-ELB', subnetIds, 'internet-facing', [securityGroupId]);
// });

//ECS


 let ecsClient = new ECS();
//Create ECS Service for Cluster
// ecsClient.createCluster('Richard-Test-1').then(() => {
//   console.log('done');
// });


// //Create Task
// let containerDefinitions = [{
//   name: 'Richard-Test-Container',
//   image: '***REMOVED***.dkr.ecr.us-west-2.amazonaws.com/***REMOVED***-api:beta1',
//   disableNetworking: false,
//   privileged: false,
//   readonlyRootFilesystem: true,
//   memory: '300',
//   memoryReservation: '300',
//   essential: true,
//   portMappings: [
//     {
//       containerPort: 8080,
//       hostPort: 0,
//       protocol: 'tcp'
//     }
//   ],
//   command: [],
//   cpu: 0,
//   dnsSearchDomains: [],
//   dnsServers: [],
//   dockerLabels: {},
//   dockerSecurityOptions: [],
//   entryPoint: [],
//   environment: [],
//   extraHosts: [],
//   hostname: null,
//   links: [],
//   logConfiguration: {
//     logDriver: 'json-file'
//   },
//   mountPoints: [],
//   ulimits: [],
//   user: null,
//   volumesFrom: [],
//   workingDirectory: null
// }];
//
// ecsClient.registerTaskDefinition('Richard-Test-Task', 'bridge', 'arn:aws:iam::***REMOVED***:role/ecsTaskRole', containerDefinitions).then(result => {
//   console.log(`Register Task Definition: ${JSON.stringify(result)}`);
// });

//Create AutoScaling Group + Launch Configuration per Cluster
let autoScalingClient = new AutoScaling();

// autoScalingClient.createLaunchConfiguration('Richard-Test-LC', 'ami-7abc111a', 'sg-b90f29c0', 't2.micro', null, 'Richard-Test-1').then(result => {
//   console.log(`Create LC Done: ${JSON.stringify(result)}`);
//
//   //Create AutoScalingGroup
//   autoScalingClient.createAutoScalingGroup('***REMOVED***-Dev', 'Richard-Test-ASG', 'Richard-Test-LC', 1, 3, 2, ['arn:aws:elasticloadbalancing:us-west-2:***REMOVED***:targetgroup/Richard-Test-TargetGroup/2bdc1642b2c7e12b'], 'subnet-c2e507a5,subnet-e975719f').then(result => {
//     console.log(`Auto Scale Group Created: ${JSON.stringify(result)}`);
//   });
// });

// //Create Target Group
// elbClient.createTargetGroup('***REMOVED***-Dev', 'Richard-Test-TargetGroup', 80, 'HTTP', 'vpc-fc14d59b', { HealthCheckPath: '/health'}).then(result => {
//   console.log(`Target Group Created: ${JSON.stringify(result)}`);
// });
//
// //Create Listener
// elbClient.createListener('arn:aws:elasticloadbalancing:us-west-2:***REMOVED***:loadbalancer/app/Richard-Test-App-ELB/c37c92a77adf30f2', 'arn:aws:elasticloadbalancing:us-west-2:***REMOVED***:targetgroup/Richard-Test-TargetGroup/2bdc1642b2c7e12b', 'HTTP', 80).then(result => {
//   console.log(`Listener created: ${JSON.stringify(result)}`);
// });





// //Create ECS Service for Cluster / associate with ELB
// ecsClient.createService('Richard-Test-1', 'Richard-Test-Service', 'Richard-Test-Task', 2, 'Richard-Test-Container', 8080, 'arn:aws:elasticloadbalancing:us-west-2:***REMOVED***:targetgroup/Richard-Test-TargetGroup/2bdc1642b2c7e12b').then(result => {
//   console.log(`Create Service: ${JSON.stringify(result)}`);
// });


//Update Service with new Task Definition
// ecsClient.updateService('Richard-Test-1', 'Richard-Test-Service', 'Richard-Test-Task', 2).then(result => {
//   console.log(`UpdateService: ${JSON.stringify(result)}`);
// });

//Create Application Auto Scaling for Task


let deployer = new Deployer('us-west-2');

deployer.createInfrastructure(infrastructureDefinition);


module.exports = function() {
  return {
    VpcClient: VPC,
    EcsClient: ECS,
    Ec2Client: EC2,
    ElbClient: ELB,
    AutoScalingClient: AutoScaling
  };
}();
