const VPC = require('./vpcClient.js');


//VPC Creation


// let vpcClient = new VPC();
//
// let vpcConfig = {
//   name: 'Richard Test',
//   environment: '***REMOVED***-Dev',
//   cidrBlock: '10.0.0.0/16',
//   subnets: [
//     { name: 'ELB Subnet 1', cidrBlock: '10.0.1.0/24', networkAclName: 'ELB Network Acl'},
//     { name: 'ELB Subnet 2', cidrBlock: '10.0.3.0/24', networkAclName: 'ELB Network Acl'},
//     { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', networkAclName: 'Instance Network Acl'},
//     { name: 'Instance Subnet 2', cidrBlock: '10.0.4.0/24', networkAclName: 'Instance Network Acl'}
//   ],
//   networkAcls: [
//     {
//       name: 'ELB Network Acl',
//       rules: [
//         {
//           cidrBlock: '0.0.0.0/0',
//           egress: false,
//           protocol: '-1',
//           ruleAction: 'allow',
//           ruleNumber: 100
//         },
//         {
//           cidrBlock: '0.0.0.0/0',
//           egress: true,
//           protocol: '-1',
//           ruleAction: 'allow',
//           ruleNumber: 100
//         }
//       ]
//     },
//     {
//       name: 'Instance Network Acl',
//       rules: [
//         {
//           cidrBlock: '10.0.0.0/16',
//           egress: false,
//           protocol: '-1',
//           ruleAction: 'allow',
//           ruleNumber: 100
//         },
//         {
//           cidrBlock: '0.0.0.0/0',
//           egress: true,
//           protocol: '-1',
//           ruleAction: 'allow',
//           ruleNumber: 100
//         }
//       ]
//     }
//   ]
// };
//
// vpcClient.createVpcFromConfig(vpcConfig);

module.exports = function() {
  return {
    VpcClient: VPC
  };
}();
