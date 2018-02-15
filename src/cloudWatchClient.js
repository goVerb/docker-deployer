const AWS = require('aws-sdk');
const __ = require('lodash');

const BaseClient = require('./baseClient');

class CloudWatchClient extends BaseClient {

  get _awsCloudWatchClient() {
    if(!this._internalCloudWatchClient) {
      let params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2010-08-01',
        region: this._region
      };
      this._internalCloudWatchClient = new AWS.CloudWatch(params);
    }

    return this._internalCloudWatchClient;
  }

  /**
   * Creates or updates a an alarm.
   * @param {Object} params
   * @param {string} params.AlarmName
   * @param {string} params.ComparisonOperator
   * @param {number} params.EvaluationPeriods
   * @param {string} params.MetricName
   * @param {string} params.Namespace
   * @param {number} params.Period
   * @param {number} params.Threshold
   * @param {boolean} params.ActionsEnabled
   * @param {array} params.AlarmActions
   * @param {array} params.Dimensions
   * @param {string} params.Statistic
   * @param {string} params.Unit
   * @return {Promise.<TResult>|*}
   */
  async putMetricAlarm(params) {
    return await this._awsCloudWatchClient.putMetricAlarm(params).promise();
  }

}

module.exports = CloudWatchClient;
