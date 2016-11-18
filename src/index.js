const aws = require('aws-sdk');
const VPC = require('./vpcClient.js');


//VPC Creation


let vpcClient = new VPC();

vpcClient.doesVpcExists('Richard Test').then(exists => {
  if(exists) {
    return;
  }
  else {
    return vpcClient.createVpc('Richard Test', '***REMOVED***-Dev', '10.0.0.0/16');
  }
});



vpcClient.getVpcIdFromName('Richard Test').then(result => {
  console.log(`Result: ${JSON.stringify(result)}`);
});




