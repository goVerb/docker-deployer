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

  describe('_publishVersion', () => {
    let lambdaClient;
    let awsLambdaServiceMock;
    beforeEach(() => {
      awsLambdaServiceMock = {
        publishVersion: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({FunctionName: ''});
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Lambda: function() {
          return awsLambdaServiceMock;
        }
      };


      //Setting up Lambda clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Lambda = proxyquire('../src/lambdaClient', mocks);
      lambdaClient = new Lambda();
    });

    it('should pass FunctionName to publishVersion', () => {
      //Arrange
      const payload = {functionName: 'askjldsijfdsaifdsj'};

      //Act
      const resultPromise = lambdaClient._publishVersion(payload);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.publishVersion.args[0][0]).to.be.deep.equal({FunctionName: payload.functionName});
      });
    });

    it('should call publishVersion once', () => {
      //Arrange
      const payload = {FunctionName: 'askjldsijfdsaifdsj'};

      //Act
      const resultPromise = lambdaClient._publishVersion(payload);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.publishVersion.calledOnce).to.be.true;
      });
    });

    it('should return result via promise on success', () => {
      //Arrange
      const payload = {functionName: 'askjldsijfdsaifdsj'};
      const returnedResult = { something: 'unique'};

      awsLambdaServiceMock.publishVersion = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.resolve(returnedResult);
        }
      });


      //Act
      const resultPromise = lambdaClient._publishVersion(payload);

      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.deep.equal(returnedResult);
      })
    });

    it('should return rejected promise on error', () => {
      //Arrange
      const payload = {functionName: 'askjldsijfdsaifdsj'};

      awsLambdaServiceMock.publishVersion = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.reject(new Error('custom error'));
        }
      });

      //Act
      const resultPromise = lambdaClient._publishVersion(payload);

      //Assert
      return resultPromise.then(() => {
        expect.fail();
      }).catch(err => {
        expect(err).to.have.property('message', 'custom error');
      });
    });
  });

  describe('_addLoggingLambdaPermissionToLambda', () => {
    let lambdaClient;
    let awsLambdaServiceMock;
    beforeEach(() => {
      awsLambdaServiceMock = {
        addPermission: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({Statement: ''});
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Lambda: function() {
          return awsLambdaServiceMock;
        }
      };


      //Setting up Lambda clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Lambda = proxyquire('../src/lambdaClient', mocks);
      lambdaClient = new Lambda();
    });

    it('should pass Action parameter to addPermission', () => {
      //Arrange
      const config = {
        logging: {
          LambdaFunctionName: 'cloudwatch-lambda-logger',
          Principal: 'logs.us-west-3.amazonaws.com'
        }
      };

      //Act
      const resultPromise = lambdaClient._addLoggingLambdaPermissionToLambda(config);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.addPermission.args[0][0]).to.have.property('Action', 'lambda:InvokeFunction');
      });

    });

    it('should pass FunctionName parameter to addPermission', () => {
      //Arrange
      const config = {
        logging: {
          LambdaFunctionName: 'cloudwatch-lambda-logger',
          Principal: 'logs.us-west-3.amazonaws.com'
        }
      };

      //Act
      const resultPromise = lambdaClient._addLoggingLambdaPermissionToLambda(config);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.addPermission.args[0][0]).to.have.property('FunctionName', config.logging.LambdaFunctionName);
      });
    });

    it('should pass Principal parameter to addPermission', () => {
      //Arrange
      const config = {
        logging: {
          LambdaFunctionName: 'cloudwatch-lambda-logger',
          Principal: 'logs.us-west-3.amazonaws.com'
        }
      };

      //Act
      const resultPromise = lambdaClient._addLoggingLambdaPermissionToLambda(config);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.addPermission.args[0][0]).to.have.property('Principal', config.logging.Principal);
      });
    });

    it('should pass StatementId parameter to addPermission', () => {
      //Arrange
      const config = {
        logging: {
          LambdaFunctionName: 'cloudwatch-lambda-logger',
          Principal: 'logs.us-west-3.amazonaws.com'
        }
      };

      //Act
      const resultPromise = lambdaClient._addLoggingLambdaPermissionToLambda(config);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.addPermission.args[0][0]).to.have.property('StatementId', `${config.logging.LambdaFunctionName}LoggingId`);
      });
    });

    it('should call addPermission once', () => {
      //Arrange
      const config = {
        logging: {
          LambdaFunctionName: 'cloudwatch-lambda-logger',
          Principal: 'logs.us-west-3.amazonaws.com'
        }
      };

      //Act
      const resultPromise = lambdaClient._addLoggingLambdaPermissionToLambda(config);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.addPermission.calledOnce).to.be.true;
      });
    });

    it('should not return a rejected promise if statementId already exist', () => {
      //Arrange
      const config = {
        logging: {
          LambdaFunctionName: 'cloudwatch-lambda-logger',
          Principal: 'logs.us-west-3.amazonaws.com'
        }
      };
      awsLambdaServiceMock.addPermission = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.reject(new Error('The statement id (kafjidojifdlajfildajfdasifjdasil) provided already exists. Please provide a new statement id, or remove the existing statement.'))
        }
      });

      //Act
      const resultPromise = lambdaClient._addLoggingLambdaPermissionToLambda(config);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.addPermission.calledOnce).to.be.true;
      });
    });

    it('should return resolved promise on success with no payload', () => {
      //Arrange
      const config = {
        logging: {
          LambdaFunctionName: 'cloudwatch-lambda-logger',
          Principal: 'logs.us-west-3.amazonaws.com'
        }
      };
      awsLambdaServiceMock.addPermission = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.reject(new Error('The statement id (kafjidojifdlajfildajfdasifjdasil) provided already exists. Please provide a new statement id, or remove the existing statement.'))
        }
      });

      //Act
      const resultPromise = lambdaClient._addLoggingLambdaPermissionToLambda(config);

      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.undefined;
      });
    });

    it('should return a rejected promise on any other error besides statementId exist', () => {
      //Arrange
      const config = {
        logging: {
          LambdaFunctionName: 'cloudwatch-lambda-logger',
          Principal: 'logs.us-west-3.amazonaws.com'
        }
      };
      awsLambdaServiceMock.addPermission = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.reject(new Error('fdsjkaljfisajfadsif'))
        }
      });

      //Act
      const resultPromise = lambdaClient._addLoggingLambdaPermissionToLambda(config);

      //Assert
      return resultPromise.then(() => {
        expect().fail()
      }).catch(err => {
        expect(err).to.have.property('message', 'fdsjkaljfisajfadsif');
      });
    });
  });

  describe('_updateLambdaConfig', () => {
    let lambdaClient;
    let awsLambdaServiceMock;
    beforeEach(() => {
      awsLambdaServiceMock = {
        updateFunctionConfiguration: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({FunctionName: ''});
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Lambda: function() {
          return awsLambdaServiceMock;
        }
      };


      //Setting up Lambda clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Lambda = proxyquire('../src/lambdaClient', mocks);
      lambdaClient = new Lambda();
    });

    it('should pass FunctionName to updateFunctionConfiguration', () => {
      //Arrange
      const payload = {FunctionName: 'askjldsijfdsaifdsj'};

      //Act
      const resultPromise = lambdaClient._updateLambdaConfig(payload);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.updateFunctionConfiguration.args[0][0]).to.be.deep.equal({FunctionName: payload.FunctionName});
      });
    });

    it('should call updateFunctionConfiguration once', () => {
      //Arrange
      const payload = {FunctionName: 'askjldsijfdsaifdsj'};

      //Act
      const resultPromise = lambdaClient._updateLambdaConfig(payload);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.updateFunctionConfiguration.calledOnce).to.be.true;
      });
    });

    it('should return undefined result via promise on success', () => {
      //Arrange
      const payload = {functionName: 'askjldsijfdsaifdsj'};

      awsLambdaServiceMock.updateFunctionConfiguration = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.resolve(null);
        }
      });


      //Act
      const resultPromise = lambdaClient._updateLambdaConfig(payload);

      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.undefined;
      })
    });

    it('should return rejected promise on error', () => {
      //Arrange
      const payload = {functionName: 'askjldsijfdsaifdsj'};

      awsLambdaServiceMock.updateFunctionConfiguration = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.reject(new Error('custom error'));
        }
      });

      //Act
      const resultPromise = lambdaClient._updateLambdaConfig(payload);

      //Assert
      return resultPromise.then(() => {
        expect.fail();
      }).catch(err => {
        expect(err).to.have.property('message', 'custom error');
      });
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
        Lambda: function() {
          return awsLambdaServiceMock;
        }
      };


      //Setting up Lambda clients
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

  describe('_deleteLambdaFunctionVersion', () => {
    let lambdaClient;
    let awsLambdaServiceMock;
    beforeEach(() => {
      awsLambdaServiceMock = {
        deleteFunction: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({});
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Lambda: function() {
          return awsLambdaServiceMock;
        }
      };


      //Setting up Lambda clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Lambda = proxyquire('../src/lambdaClient', mocks);
      lambdaClient = new Lambda();
    });

    it('should pass FunctionName to deleteFunction', () => {
      //Arrange
      const config = {
        functionName: 'functionNameUnique1'
      };
      const versionToDelete = 'jlijadilasjdiadsa';

      //Act
      const resultPromise = lambdaClient._deleteLambdaFunctionVersion(config, versionToDelete);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.deleteFunction.args[0][0]).to.have.property('FunctionName', config.functionName);
      });
    });

    it('should pass Qualifier to deleteFunction', () => {
      //Arrange
      const config = {
        functionName: 'functionNameUnique1'
      };
      const versionToDelete = 'jlijadilasjdiadsa';

      //Act
      const resultPromise = lambdaClient._deleteLambdaFunctionVersion(config, versionToDelete);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.deleteFunction.args[0][0]).to.have.property('Qualifier', versionToDelete);
      });
    });

    it('should call deleteFunction once', () => {
      //Arrange
      const config = {
        functionName: 'functionNameUnique1'
      };
      const versionToDelete = 'jlijadilasjdiadsa';

      //Act
      const resultPromise = lambdaClient._deleteLambdaFunctionVersion(config, versionToDelete);

      //Assert
      return resultPromise.then(() => {
        expect(awsLambdaServiceMock.deleteFunction.calledOnce).to.be.true;
      });
    });

    it('should not returned a rejected promise on error', () => {
      //Arrange
      const config = {
        functionName: 'functionNameUnique1'
      };
      const versionToDelete = 'jlijadilasjdiadsa';

      awsLambdaServiceMock.deleteFunction = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.reject(new Error());
        }
      });

      //Act
      const resultPromise = lambdaClient._deleteLambdaFunctionVersion(config, versionToDelete);

      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.undefined;
      });

    });

    it('should result should be undefined on success', () => {
      //Arrange
      const config = {
        functionName: 'functionNameUnique1'
      };
      const versionToDelete = 'jlijadilasjdiadsa';

      awsLambdaServiceMock.deleteFunction = sandbox.stub().returns({
        promise: () => {
          return BluebirdPromise.resolve();
        }
      });

      //Act
      const resultPromise = lambdaClient._deleteLambdaFunctionVersion(config, versionToDelete);

      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.undefined;
      });
    });
  });
});
