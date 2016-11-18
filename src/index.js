const aws = require('aws-sdk');
const VPC = require('./vpcClient.js');
const BlueBirdPromise = require('bluebird');


//VPC Creation


let vpcClient = new VPC();

let vpcName = 'Richard Test';

let vpcConfig = {
  name: 'Richard Test',
  environment: '***REMOVED***-Dev',
  cidrBlock: '10.0.0.0/16',
  subnets: [
    { name: 'ELB Subnet 1', cidrBlock: '10.0.1.0/24'},
    { name: 'ELB Subnet 2', cidrBlock: '10.0.3.0/24'},
    { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24'},
    { name: 'Instance Subnet 2', cidrBlock: '10.0.4.0/24'}
  ]
};

vpcClient.createVpcFromConfig(vpcConfig);
/*
vpcClient.doesVpcExists(vpcName).then(exists => {
  if(exists) {
    return;
  }
  else {
    let vpcId = '';
    let internetGatewayId = '';
    return vpcClient.createVpc(vpcName, '***REMOVED***-Dev', '10.0.0.0/16').then(createdVpcId => {
      vpcId = createdVpcId;

      return;
    }).then(() => {

      let subnetPromises = [];
      subnetPromises.push(vpcClient.createVpcSubnet(vpcId, 'ELB Subnet', '***REMOVED***-Dev', '10.0.1.0/24'));
      subnetPromises.push(vpcClient.createVpcSubnet(vpcId, 'ELB Subnet', '***REMOVED***-Dev', '10.0.3.0/24'));
      subnetPromises.push(vpcClient.createVpcSubnet(vpcId, 'Instance Subnet', '***REMOVED***-Dev', '10.0.2.0/24'));
      subnetPromises.push(vpcClient.createVpcSubnet(vpcId, 'Instance Subnet', '***REMOVED***-Dev', '10.0.4.0/24'));

      return BlueBirdPromise.all(subnetPromises);
    }).then(() => {
      return vpcClient.createAndAttachInternetGateway(vpcId, `${vpcName} - Internet Gateway`, '***REMOVED***-Dev').then(createdInternetGatewayId => {
        internetGatewayId = createdInternetGatewayId;
      });
    }).then(() => {
      //Create Route Table and associate it with Subnets
      let routeTableId = '';

      return vpcClient.createRouteTable(vpcId, `${vpcName} - Route Table`, '***REMOVED***-Dev').then(createdRouteTableId => {
        routeTableId = createdRouteTableId;
      }).then(() => {
        return vpcClient.addInternetGatewayToRouteTable(internetGatewayId, routeTableId);
      }).then(() => {
        //associate subnets with route table
      });
    });
  }
}).then(() => {
  console.log('done');
});


*/