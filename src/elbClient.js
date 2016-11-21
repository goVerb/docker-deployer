const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

AWS.config.setPromisesDependency(BlueBirdPromise);


class ElbClient {

  constructor(region = 'us-west-2') {
    this.elbv2Client = new AWS.ELBv2({apiVersion: '2015-12-01', region: region});
  }

  /**
   *
   * @param environment
   * @param appElbName
   * @param subnetIds
   * @param scheme Possible Values: 'internet-facing' | 'internal'
   * @param securityGroups
   */
  createApplicationLoadBalancer(environment, appElbName, subnetIds, scheme, securityGroupIds) {
    let params = {
      Name: appElbName, /* required */
      Subnets: subnetIds,
      Scheme: scheme,
      SecurityGroups: securityGroupIds,
      Tags: [
        {
          Key: 'Environment', /* required */
          Value: environment
        },
      ]
    };


    let createAppLoadBalancerPromise = this.elbv2Client.createLoadBalancer(params).promise();

    return createAppLoadBalancerPromise;
  }

  getApplicationLoadBalancerIdByName(appElbName) {

  }

  /**
   *
   * @param resourceId
   * @param tags Array of objects which contain a Key and Value key
   * @param addCreatedTag
   * @returns {Promise.<TResult>}
   * @private
   */
  _createTagsForElbV2(resourceId, tags, addCreatedTag = true) {

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
    return this.elbv2Client.createTags(createTagParams).promise();
  }

  /**
   * Logs messages
   * @param msg
   */
  logMessage(msg) {
    console.log(msg);
  }
}


module.exports = ElbClient;