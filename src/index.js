const VPC = require('./vpcClient.js');
const ECS = require('./ecsClient.js');
const ELB = require('./elbClient.js');
const EC2 = require('./ec2Client.js');
const AutoScaling = require('./autoScalingClient.js');
const BlueBirdPromise = require('bluebird');

//VPC Creation


 let vpcClient = new VPC();


//
// let vpcConfig = {
//   name: 'Richard Test 2',
//   environment: '***REMOVED***-Dev',
//   cidrBlock: '10.0.0.0/16',
//   subnets: [
//     { name: 'ELB Subnet 1', cidrBlock: '10.0.1.0/24', availabilityZone: 'us-west-2a', networkAclName: 'ELB Network Acl'},
//     { name: 'ELB Subnet 2', cidrBlock: '10.0.3.0/24', availabilityZone: 'us-west-2b', networkAclName: 'ELB Network Acl'},
//     { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 'us-west-2a', networkAclName: 'Instance Network Acl'},
//     { name: 'Instance Subnet 2', cidrBlock: '10.0.4.0/24', availabilityZone: 'us-west-2b', networkAclName: 'Instance Network Acl'}
//   ],
//   networkAcls: [
//     {
//       name: 'ELB Network Acl',
//       rules: [
//         { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
//         { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
//       ]
//     },
//     {
//       name: 'Instance Network Acl',
//       rules: [
//         { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
//         { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
//       ]
//     }
//   ]
// };
//
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

//Cluster creation

 let ecsClient = new ECS();
//
// ecsClient.createCluster('Richard-Test-1').then(() => {
//   console.log('done');
// });

// let containerDefinitions = [{
//   name: 'Richard-Test-Container',
//   image: '***REMOVED***.dkr.ecr.us-west-2.amazonaws.com/***REMOVED***-api:latest',
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

autoScalingClient.createLaunchConfiguration('Richard-Test-LC', 'ami-7abc111a', 'sg-b90f29c0', 't2.micro', null, 'Richard-Test-1').then(result => {
  console.log(`Create LC Done: ${JSON.stringify(result)}`);
});


//Create ECS Service for Cluster / associate with ELB


//Create Application Auto Scaling for Task



module.exports = function() {
  return {
    VpcClient: VPC,
    EcsClient: ECS,
    Ec2Client: EC2,
    ElbClient: ELB,
    AutoScalingClient: AutoScaling
  };
}();
