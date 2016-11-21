const VPC = require('./vpcClient.js');
const ECS = require('./ecsClient.js');
const ELB = require('./elbClient.js');


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

//ECS

//Cluster creation

// let ecsClient = new ECS();
//
// ecsClient.createCluster('Richard-Test-1').then(() => {
//   console.log('done');
// });

//TODO: Create Security Group for VPC

let elbClient = new ELB();

vpcClient.getSubnetIdsFromSubnetName('vpc-fc14d59b', ['Instance Subnet 1', 'Instance Subnet 2']).then(result => {
  elbClient.createApplicationLoadBalancer('***REMOVED***-API', 'Richard-Test-App-ELB', result, 'internet-facing', ['']);
});



module.exports = function() {
  return {
    VpcClient: VPC,
    EcsClient: ECS
  };
}();
