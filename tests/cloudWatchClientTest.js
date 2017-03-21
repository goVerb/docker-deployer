'use strict';

const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const mockery = require('mockery');
const __ = require('lodash');
const BluebirdPromise = require('bluebird');


require('sinon-as-promised');
chai.use(chaiAsPromised);


describe('CloudWatch Client', function() {
  let sandbox;

  beforeEach(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    });
    mockery.registerAllowable('aws-sdk', true);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    mockery.disable();
    mockery.deregisterAll();
    sandbox.restore();
  });


  describe('getter _awsCloudWatchClient', () => {
    it('should pass accessKey and secretKey to CloudWatch client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudWatch: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';

      const CloudWatch = require('../src/cloudWatchClient');
      const cloudWatchClientService = new CloudWatch(accessKey, secretKey);


      //Act
      cloudWatchClientService._awsCloudWatchClient;

      //Assert
      let params = mockAwsSdk.CloudWatch.args[0][0];
      expect(params.accessKeyId).to.equal(accessKey);
      expect(params.secretAccessKey).to.equal(secretKey);
    });
  });


  describe('putMetricAlarm', () => {
    it('should pass params to this._awsCloudWatchClient.putMetricAlarm', () => {
      //Arrange

      //Setting up CF clients
      const CloudWatch = require('../src/cloudWatchClient');
      const cloudWatchClientService = new CloudWatch();

      cloudWatchClientService.putMetricAlarm = sandbox.stub().resolves();

      let putMetricAlarmParams = {
        AlarmName: 'Fake-Name',
        ComparisonOperator: 'GreaterThanOrEqualToThreshold', /* required */
        EvaluationPeriods: 1, /* required */
        MetricName: 'CPUUtilization', /* required */
        Namespace: 'AWS/ECS', /* required */
        Period: 300, /* required */
        Threshold: 75.0, /* required */
        ActionsEnabled: true,
        AlarmActions: [],
        Dimensions: [
          {
            Name: 'ClusterName', /* required */
            Value: 'Fake-Cluster' /* required */
          },
          {
            Name: 'ServiceName', /* required */
            Value: 'Fake-Cluster-Service' /* required */
          }
        ],
        Statistic: 'Average',
        Unit: 'Seconds'
      };

      //Act
      let resultPromise = cloudWatchClientService.putMetricAlarm(putMetricAlarmParams);

      //Assert
      return resultPromise.then(() => {
        let params = cloudWatchClientService.putMetricAlarm.args[0][0];
        expect(params).to.deep.equal(putMetricAlarmParams);
      });
    });
  });


});
