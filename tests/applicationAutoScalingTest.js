'use strict';

const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const __ = require('lodash');
const BluebirdPromise = require('bluebird');
import proxyquire from 'proxyquire';


require('sinon-as-promised');
chai.use(chaiAsPromised);


describe('ApplicationAutoScaling Client', function() {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });


  describe('getter _awsApplicationAutoScalingClient', () => {
    it('should pass accessKey and secretKey to ApplicationAutoScaling client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        ApplicationAutoScaling: sandbox.stub()

      };

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ApplicationAutoScaling = proxyquire('../src/applicationAutoScalingClient', mocks);
      const applicationAutoScalingClientService = new ApplicationAutoScaling(accessKey, secretKey);


      //Act
      applicationAutoScalingClientService._awsApplicationAutoScalingClient;

      //Assert
      let params = mockAwsSdk.ApplicationAutoScaling.args[0][0];
      expect(params.accessKeyId).to.equal(accessKey);
      expect(params.secretAccessKey).to.equal(secretKey);
    });
  });


  describe('registerScalableTarget', () => {
    it('should pass params to this._awsApplicationAutoScalingClient.registerScalableTarget', () => {
      //Arrange

      //Setting up CF clients
      const ApplicationAutoScaling = require('../src/applicationAutoScalingClient');
      const applicationAutoScalingClientService = new ApplicationAutoScaling();

      applicationAutoScalingClientService.registerScalableTarget = sandbox.stub().resolves();

      let registerScalableTargetParams = {
        ResourceId: 'service/Fake-Cluster/Fake-Cluster-Service',
        ScalableDimension: 'ecs:service:DesiredCount',
        ServiceNamespace: 'ecs',
        MaxCapacity: 2,
        MinCapacity: 1,
        RoleARN: 'arn:blah'
      };

      //Act
      let resultPromise = applicationAutoScalingClientService.registerScalableTarget(registerScalableTargetParams);

      //Assert
      return resultPromise.then(() => {
        let params = applicationAutoScalingClientService.registerScalableTarget.args[0][0];
        expect(params).to.deep.equal(registerScalableTargetParams);
      });
    });
  });


  describe('putScalingPolicy', () => {
    it('should pass params to this._awsApplicationAutoScalingClient.putScalingPolicy', () => {
      //Arrange

      //Setting up CF clients
      const ApplicationAutoScaling = require('../src/applicationAutoScalingClient');
      const applicationAutoScalingClientService = new ApplicationAutoScaling();

      applicationAutoScalingClientService.putScalingPolicy = sandbox.stub().resolves();

      let putScalingPolicyParams = {
        PolicyName: 'Scaling-Out-Policy-Env',
        ResourceId: 'service/Fake-Cluster/Fake-Cluster-Service-Env',
        ScalableDimension: 'ecs:service:DesiredCount',
        ServiceNamespace: 'ecs',
        PolicyType: 'StepScaling',
        StepScalingPolicyConfiguration: {
          AdjustmentType: 'ChangeInCapacity',
          Cooldown: 0,
          MetricAggregationType: 'Average',
          StepAdjustments: [
            {
              MetricIntervalLowerBound:0,
              ScalingAdjustment:1
            }
          ]
        }
      };

      //Act
      let resultPromise = applicationAutoScalingClientService.putScalingPolicy(putScalingPolicyParams);

      //Assert
      return resultPromise.then(() => {
        let params = applicationAutoScalingClientService.putScalingPolicy.args[0][0];
        expect(params).to.deep.equal(putScalingPolicyParams);
      });
    });
  });


});
