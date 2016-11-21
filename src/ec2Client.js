const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

AWS.config.setPromisesDependency(BlueBirdPromise);

class Ec2Client {

  constructor(region = 'us-west-2') {
    this.ec2Client = new AWS.EC2({apiVersion: '2016-09-15', region: region});
  }

  /**
   * Creates a security group with the given json configs
   * @param securityGroupConfig
   * {
   *  name: <name of the security group>,
   *  description: <description of the security group>,
   *  vpcId: <optional field that has the vpcId that should be associated with the security group>,
   *  rules: [
   *    {
   *      egress: true | false - Note: If false, applies to inbound, if true, applies to outbound traffic,
   *      protocol: tcp | udp | -1 (all),
   *      fromPort: <number 0 - 65535>,
   *      toPort: <number 0 - 65535>,
   *      allowedIpCidrBlock: <cidr block allowed to access>
   *    }
   *  ]
   */
  createSecurityGroupFromConfig(securityGroupConfig) {

    //Check if security group exists before creating
  }

  _createSecurityGroup(sgName, description = '', vpcId = null) {
    let params = {
      Description: description, /* required */
      GroupName: sgName, /* required */
      DryRun: false
    };

    if(vpcId) {
      params.VpcId = vpcId;
    }

    this.logMessage(`Creating Security Group [Name: ${sgName}] [Description: ${description}] [VpcId: ${vpcId}]`);
    let createSecurityGroupPromise = this.ec2Client.createSecurityGroup(params).promise();

    return createSecurityGroupPromise;
  }

  /**
   * Create Outbound security group rule
   * @param securityGroupId
   * @param egress If false, applies to inbound, if true, applies to outbound traffic
   * @param protocol
   * @param fromPort
   * @param toPort
   * @param allowedIpCidrBlock
   * @private
   */
  _authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock) {
    let params = {
      GroupId: securityGroupId, /* required */
      DryRun: false,
      IpPermissions: [
        {
          FromPort: fromPort,
          IpProtocol: protocol,
          IpRanges: [
            { CidrIp: allowedIpCidrBlock }
          ],
          ToPort: toPort
        }
      ]
    };

    if(egress) {
      return this.ec2Client.authorizeSecurityGroupEgress(params).promise();
    } else {
      return this.ec2Client.authorizeSecurityGroupIngress(params).promise();
    }
  }

  _getSecurityGroupIdFromNameAndVpcId(securityGroupName, vpcId = null) {

  }



  /**
   * Logs messages
   * @param msg
   */
  logMessage(msg) {
    console.log(msg);
  }
}


module.exports = Ec2Client;