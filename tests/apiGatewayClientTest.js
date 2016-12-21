const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const mockery = require('mockery');
const __ = require('lodash');
const BluebirdPromise = require('bluebird');
const base64 = require('base-64');


require('sinon-as-promised');
chai.use(chaiAsPromised);


describe('APIGateway Client', function() {
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
  
  describe('getter _apiGatewayClient', () => {
    it('should pass accessKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        APIGateway: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const APIGateway = require('../src/apiGatewayClient');
      const apiGatewayService = new APIGateway(accessKey, secretKey, region);


      //Act
      apiGatewayService._apiGatewayClient;

      //Assert
      let params = mockAwsSdk.APIGateway.args[0][0];
      expect(params).to.have.property('accessKeyId', accessKey);
    });

    it('should pass secretKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        APIGateway: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const APIGateway = require('../src/apiGatewayClient');
      const apiGatewayService = new APIGateway(accessKey, secretKey, region);


      //Act
      apiGatewayService._apiGatewayClient;

      //Assert
      let params = mockAwsSdk.APIGateway.args[0][0];
      expect(params).to.have.property('secretAccessKey', secretKey);
    });

    it('should pass region to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        APIGateway: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const APIGateway = require('../src/apiGatewayClient');
      const apiGatewayService = new APIGateway(accessKey, secretKey, region);


      //Act
      apiGatewayService._apiGatewayClient;

      //Assert
      let params = mockAwsSdk.APIGateway.args[0][0];
      expect(params).to.have.property('region', region);
    });

    it('should pass default region of us-west-2 if none specified', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        APIGateway: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const APIGateway = require('../src/apiGatewayClient');
      const apiGatewayService = new APIGateway(accessKey, secretKey);


      //Act
      apiGatewayService._apiGatewayClient;

      //Assert
      let params = mockAwsSdk.APIGateway.args[0][0];
      expect(params).to.have.property('region', 'us-west-2');
    });
  });

  
  
});
