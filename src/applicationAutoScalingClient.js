const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BlueBirdPromise);

class ApplicationAutoScalingClient extends BaseClient {

  get _awsApplicationAutoScalingClient() {
    if(!this._internalApplicationAutoScalingClient) {
      let params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2016-02-06',
        region: this._region
      };
      this._internalApplicationAutoScalingClient = new AWS.ApplicationAutoScaling(params);
    }

    return this._internalApplicationAutoScalingClient;
  }

  /**
   * Registers or updates a scalable target. A scalable target is a resource that Application Auto Scaling can scale out or scale in. After you have registered a scalable target, you can use this operation to update the minimum and maximum values for your scalable dimension.
   * @param {Object} params
   * @param {string} params.ResourceId - e.g. service
   * @param {string} params.ScalableDimension
   * @param {string} params.ServiceNamespace
   * @param {int} params.MaxCapacity
   * @param {int} params.MinCapacity
   * @param {string} params.RoleARN
   * @return {Promise.<TResult>|*}
   */
  registerScalableTarget(params) {
    return this._awsApplicationAutoScalingClient.registerScalableTarget(params).promise();
  }


  /**
   * Creates or updates a policy for an Application Auto Scaling scalable target.
   * @param {Object} params
   * @param {string} params.PolicyName
   * @param {string} params.ResourceId
   * @param {string} params.ScalableDimension
   * @param {string} params.ServiceNamespace
   * @param {string} params.PolicyType
   * @param {object} params.StepScalingPolicyConfiguration
   * @return {Promise.<TResult>|*}
   */
  putScalingPolicy(params) {
    return this._awsApplicationAutoScalingClient.putScalingPolicy(params).promise();
  }

}

module.exports = ApplicationAutoScalingClient;
