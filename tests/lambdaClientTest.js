const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const __ = require('lodash');
const BluebirdPromise = require('bluebird');
import proxyquire from 'proxyquire';



chai.use(chaiAsPromised);




describe('Lambda Client', function() {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getter _awsLambdaClient', () => {
    it('should pass accessKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        Lambda: sandbox.stub()

      };

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const Lambda = proxyquire('../src/lambdaClient', mocks);
      const lambdaClientService = new Lambda(accessKey, secretKey, region);


      //Act
      lambdaClientService._awsLambdaClient;

      //Assert
      let params = mockAwsSdk.Lambda.args[0][0];
      expect(params).to.have.property('accessKeyId', accessKey);
    });

    it('should pass secretKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        Lambda: sandbox.stub()

      };

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const Lambda = proxyquire('../src/lambdaClient', mocks);
      const lambdaClientService = new Lambda(accessKey, secretKey, region);


      //Act
      lambdaClientService._awsLambdaClient;

      //Assert
      let params = mockAwsSdk.Lambda.args[0][0];
      expect(params).to.have.property('secretAccessKey', secretKey);
    });

    it('should pass region to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        Lambda: sandbox.stub()

      };

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const Lambda = proxyquire('../src/lambdaClient', mocks);
      const lambdaClientService = new Lambda(accessKey, secretKey, region);


      //Act
      lambdaClientService._awsLambdaClient;

      //Assert
      let params = mockAwsSdk.Lambda.args[0][0];
      expect(params).to.have.property('region', region);
    });

    it('should pass default region of us-west-2 if none specified', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        Lambda: sandbox.stub()

      };

      //Setting up Lambda clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const Lambda = proxyquire('../src/lambdaClient', mocks);
      const lambdaClientService = new Lambda(accessKey, secretKey);


      //Act
      lambdaClientService._awsLambdaClient;

      //Assert
      let params = mockAwsSdk.Lambda.args[0][0];
      expect(params).to.have.property('region', 'us-west-2');
    });
  });

  describe('_listVersionsByFunction', () => {
    let lambdaClient;
    let awsLambdaServiceMock;
    beforeEach(() => {
      awsLambdaServiceMock = {
        listVersionsByFunction: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({Buckets: []});
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Lambda: () => {
          return awsLambdaServiceMock;
        }
      };


      //Setting up CF clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Lambda = proxyquire('../src/lambdaClient', mocks);
      lambdaClient = new Lambda();
    });

    it('should call listVersionsByFunction once', () => {
      //Arrange
      const payload = {functionName: 'askjldsijfdsaifdsj'};

      //Act
      const resultPromise = lambdaClient._listVersionsByFunction(payload);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.listVersionsByFunction.calledOnce).to.be.true;
      });
    });

    it('should pass config.functionName to listVersionsByFunction', () => {
      //Arrange
      const payload = {functionName: 'askjldsijfdsaifdsj'};

      //Act
      const resultPromise = lambdaClient._listVersionsByFunction(payload);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.listVersionsByFunction.args[0][0]).to.be.deep.equal({FunctionName: payload.functionName});
      });
    });

    it('should return data from promise', () => {
      //Arrange
      const payload = {functionName: 'askjldsijfdsaifdsj'};
      const returnValue = {NextMarker: '', Versions: []};

      awsLambdaServiceMock.listVersionsByFunction = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.resolve(returnValue);
        }
      });

      //Act
      const resultPromise = lambdaClient._listVersionsByFunction(payload);

      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.deep.equal(returnValue);
      });
    });

    it('should catch error and return blank object of versions', () => {
      //Arrange
      const payload = {functionName: 'askjldsijfdsaifdsj'};
      const returnValue = {NextMarker: '', Versions: []};

      awsLambdaServiceMock.listVersionsByFunction = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.reject(new Error());
        }
      });

      //Act
      const resultPromise = lambdaClient._listVersionsByFunction(payload);

      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.deep.equal({Versions: []});
      });
    });

  });
});
