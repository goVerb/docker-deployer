const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));

class VpcClient {

  constructor(region = 'us-west-2') {
    this.ec2Client = new AWS.EC2({apiVersion: '2016-09-15', region: region});
  }

  /**
   * Creates a VPC with a name and environment tag; returns vpcId
   * @return Promise json object
   * data = {
       Vpc: {
         CidrBlock: "10.0.0.0/16",
         DhcpOptionsId: "dopt-7a8b9c2d",
         InstanceTenancy: "default",
         State: "pending",
         VpcId: "vpc-a01106c2"
       }
     }
   * @param name
   * @param cidrBlock The network range for the VPC, in CIDR notation. For example, 10.0.0.0/16
   */
  createVpc(name, environment, cidrBlock) {
    let params = {
      CidrBlock: cidrBlock, /* required */
      DryRun: false,
      InstanceTenancy: 'default'//'default | dedicated | host'
    };

    this.logMessage('Creating VPC');
    let createVpcPromise = this.ec2Client.createVpc(params).promise();

    let vpcId = '';
    return createVpcPromise
      .then(data => {
        vpcId = data.Vpc.VpcId;

        this.logMessage(`VPC Created [VpcId: ${vpcId}]`);
        let vpcAvailableParams = {
          VpcIds: [vpcId]
        };

        return this.ec2Client.waitFor('vpcAvailable', vpcAvailableParams).promise();
      }).then(() => {
        this.logMessage(`Assigning Tags [VpcId: ${vpcId}]`);
        //assign tags
        let createTagParams = {
          Resources: [
            vpcId
          ],
          Tags: [
            { Key: 'Name', Value: name },
            { Key: 'Environment', Value: environment },
          ],
          DryRun: false
        };
        return this.ec2Client.createTags(createTagParams).promise();
      }).catch(err => {
        console.log(`error: ${JSON.stringify(err)}`);
      });
  }

  getVpcIdFromName(name) {
    let params = {
      DryRun: false,
      Filters: [
        {
          Name: 'tag:Name',
          Values: [ name ],
        }
      ]
    };

    this.logMessage(`Looking up VPC by name. [Vpc Name: ${name}]`);
    return this.ec2Client.describeVpcs(params).promise().then(result => {
      if(result.Vpcs && result.Vpcs.length > 0) {
        return result.Vpcs[0].VpcId;
      } else {
        return '';
      }
    });
  }

  /**
   * Returns true if a VPC exists for the given name
   * @param name VpcName
   */
  doesVpcExists(name) {
    return this.getVpcIdFromName(name).then(result => {
      let exists = result !== '';
      this.logMessage(`Vpc Existence Check. [VpcName: ${name}] [VpcExists: ${exists}]`);
      return exists;
    });
  }

  createVpcSubnet(name, environment, cidrBlock) {

  }

  logMessage(msg) {
    console.log(msg);
  }
}


module.exports = VpcClient;