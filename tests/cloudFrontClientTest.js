"use strict";

const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const mockery = require('mockery');
const __ = require('lodash');
const Promise = require('bluebird');
const base64 = require('base-64');


require('sinon-as-promised');
chai.use(chaiAsPromised);


describe('CloudFront Client', function() {
  let sandbox;

  beforeEach(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    });
    mockery.registerAllowable('aws-sdk');
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    mockery.disable();
    mockery.deregisterAll();
    sandbox.restore();
  });
  
  
  describe('constructor', () => {
    it('should pass accessKey and secretKey to Cloudfront client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';

      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront(accessKey, secretKey);


      //Act
      cloudFrontClientService._cloudfrontClient;

      //Assert
      let params = mockAwsSdk.CloudFront.args[0][0];
      expect(params.accessKeyId).to.equal(accessKey);
      expect(params.secretAccessKey).to.equal(secretKey);
    });
    
  });
  
  
  // describe('createCloudFrontDistribution', () => {
  //   it('should pass accessKey and secretKey to Cloudfront client', () => {
  //     //Arrange
  //     let mockAwsSdk = {
  //       config: {
  //         setPromisesDependency: (promise) => {
  //         }
  //       },
  //       CloudFront: sandbox.stub()
  // 
  //     };
  //     mockery.registerMock('aws-sdk', mockAwsSdk);
  // 
  //     //Setting up ELB clients
  //     const accessKey = 'acckey';
  //     const secretKey = 'secret';
  // 
  //     const CloudFront = require('../src/cloudFrontClient');
  //     const cloudFrontClientService = new CloudFront(accessKey, secretKey);
  // 
  // 
  //     //Act
  //     cloudFrontClientService._cloudfrontClient;
  // 
  //     //Assert
  //     let params = mockAwsSdk.CloudFront.args[0][0];
  //     expect(params.accessKeyId).to.equal(accessKey);
  //     expect(params.secretAccessKey).to.equal(secretKey);
  //   });
  //   
  // });


});
