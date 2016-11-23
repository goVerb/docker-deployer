const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

AWS.config.setPromisesDependency(BlueBirdPromise);

class Ec2Client {

  constructor(region = 'us-west-2') {
    this._awsEc2Client = new AWS.EC2({apiVersion: '2016-09-15', region: region});
  }

  /**
   * Creates a security group with the given json configs
   * @param securityGroupConfig
   * {
   *  name: (Required) <name of the security group>,
   *  description: (Required)<description of the security group>,
   *  environment: <infrastructure environment>,
   *  vpcId: <optional field that has the vpcId that should be associated with the security group>,
   *  rules: [
   *    {
   *      egress: true | false - Note: If false, applies to inbound, if true, applies to outbound traffic,
   *      protocol: tcp | udp | -1 (all),
   *      fromPort: <number 0 - 65535>,
   *      toPort: <number 0 - 65535>,
   *      allowedIpCidrBlock: <cidr block allowed to access>,
   *      allowedSecurityGroupName: <securityGroupName allowed to access>
   *    }
   *  ]
   */
  createSecurityGroupFromConfig(environment, securityGroupConfig) {

    //Check if security group exists before creating
    return this.doesSecurityGroupExists(securityGroupConfig.name, securityGroupConfig.vpcId).then(result => {
      if(result) {
        this.logMessage(`Security group exist. No action taken. [SecurityGroupName: ${securityGroupConfig.name}] [VpcId: ${securityGroupConfig.vpcId}]`);
        return;
      }
      else {
        return this._createSecurityGroup(environment, securityGroupConfig.name, securityGroupConfig.description, securityGroupConfig.vpcId, securityGroupConfig.rules);
      }
    });
  }

  _createSecurityGroup(environment, sgName, description = '', vpcId = null, rules = []) {

    let params = {
      Description: description, /* required */
      GroupName: sgName, /* required */
      DryRun: false
    };

    if(vpcId) {
      params.VpcId = vpcId;
    }

    this.logMessage(`Creating Security Group [Name: ${sgName}] [Description: ${description}] [VpcId: ${vpcId}]`);
    let createSecurityGroupPromise = this._awsEc2Client.createSecurityGroup(params).promise();

    let securityGroupId = '';
    return createSecurityGroupPromise.then(result => {
      securityGroupId = result.GroupId;

      //assign tags
      let tags = [
        { Key: 'Name', Value: sgName },
        { Key: 'Environment', Value: environment },
      ];

      return this._createTags(securityGroupId, tags);

    }).then(() => {
      let securityGroupRulePromises = [];

      let lookupSecurityGroupIdFromName = (ruleObject) => {
        return this.getSecurityGroupIdFromName(ruleObject.allowedSecurityGroupName, vpcId).then(allowedSecurityGroupId => {

          return this._authorizeSecurityGroup(securityGroupId, ruleObject.egress, ruleObject.protocol, ruleObject.fromPort, ruleObject.toPort, ruleObject.allowedIpCidrBlock, allowedSecurityGroupId);
        });
      };

      for(let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
        let ruleObject = rules[ruleIndex];
        securityGroupRulePromises.push(lookupSecurityGroupIdFromName(ruleObject));
      }

      return BlueBirdPromise.all(securityGroupRulePromises);

    }).then(() => {
      return securityGroupId;
    });
  }

  /**
   * Create security group rule
   * @param securityGroupId
   * @param egress If false, applies to inbound, if true, applies to outbound traffic
   * @param protocol
   * @param fromPort
   * @param toPort
   * @param allowedIpCidrBlock
   * @private
   */
  _authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock = null, allowedSecurityGroupId = null) {

    if(!allowedIpCidrBlock && !allowedSecurityGroupId) {
      throw new Error(`There is no valid allowed scope. [SecurityGroupId: ${securityGroupId}] [AllowedIpCidrBlock: ${allowedIpCidrBlock}] [AllowedSecurityGroupId: ${allowedSecurityGroupId}]`);
    }

    let baseIpPermission = {
      FromPort: fromPort,
      ToPort: toPort,
      IpProtocol: protocol
    };

    if(allowedIpCidrBlock) {
      baseIpPermission.IpRanges = [ { CidrIp: allowedIpCidrBlock } ];
    }

    if(allowedSecurityGroupId) {
      baseIpPermission.UserIdGroupPairs = [ {GroupId: allowedSecurityGroupId } ];
    }

    let params = {
      GroupId: securityGroupId, /* required */
      DryRun: false,
      IpPermissions: [ baseIpPermission ]
    };

    if(egress) {
      this.logMessage(`Creating outbound security group rule. [SecurityGroupId: ${securityGroupId}] [Params: ${JSON.stringify(params)}]`);
      return this._awsEc2Client.authorizeSecurityGroupEgress(params).promise();
    } else {
      this.logMessage(`Creating inbound security group rule. [SecurityGroupId: ${securityGroupId}] [Params: ${JSON.stringify(params)}]`);
      return this._awsEc2Client.authorizeSecurityGroupIngress(params).promise();
    }
  }

  doesSecurityGroupExists(securityGroupName, vpcId = null) {
    return this.getSecurityGroupIdFromName(securityGroupName, vpcId).then(result => {
      let exists = result !== '';
      this.logMessage(`Security Group Existence Check. [SecurityGroupName: ${securityGroupName}] [VpcId: ${vpcId}] [SecurityGroupExists: ${exists}]`);
      return exists;
    });
  }

  getSecurityGroupIdFromName(securityGroupName, vpcId = null) {

    this.logMessage(`Looking up security group id from name. [SecurityGroupName: ${securityGroupName}] [VpcId: ${vpcId}]`);
    let params = {
      DryRun: false,
      Filters: [
        {
          Name: 'group-name',
          Values: [ securityGroupName ]
        }
      ]
    };


    if(vpcId) {
      this.logMessage(`Adding vpc-id parameter to filter. [VpcId: ${vpcId}]`);
      params.Filters.push({
        Name: 'vpc-id',
        Values: [ vpcId ]
      });
    }

    this.logMessage(`Initiating call. [SecurityGroupName: ${securityGroupName}] [VpcId: ${vpcId}]`);
    let describeSecurityGroupsPromise = this._awsEc2Client.describeSecurityGroups(params).promise();

    return describeSecurityGroupsPromise.then(result => {
      if(result.SecurityGroups && result.SecurityGroups.length > 0) {
        return result.SecurityGroups[0].GroupId;
      }
      else {
        return '';
      }
    });
  }

  /**
   *
   * @param resourceId
   * @param tags Array of objects which contain a Key and Value key
   * @param addCreatedTag
   * @returns {Promise.<TResult>}
   * @private
   */
  _createTags(resourceId, tags, addCreatedTag = true) {

    if(addCreatedTag) {
      tags.push({ Key: 'Created', Value:  moment().format()});
    }

    //assign tags
    let createTagParams = {
      Resources: [ resourceId ],
      Tags: tags,
      DryRun: false
    };

    this.logMessage(`Assigning Tags to ResourceId. [ResourceId: ${resourceId}] [Tags: ${JSON.stringify(tags)}]`);
    return this._awsEc2Client.createTags(createTagParams).promise();
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