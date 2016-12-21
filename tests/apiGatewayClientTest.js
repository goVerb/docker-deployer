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
          setPromisesDependency: (promise) => {
          }
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
          setPromisesDependency: (promise) => {
          }
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
          setPromisesDependency: (promise) => {
          }
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
          setPromisesDependency: (promise) => {
          }
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
  
  describe('lookupApiGatewayDomainName', () => {
    it('should return the correct domain name', (done) => {
      //Arrange
      const getRestApisResponse = {
        items: [{
          id: 'ciqzr3g5ti',
          name: 'Platform API'
        }, {
          id: 'my***REMOVED***Id',
          name: 'Test API',
          version: 'v1'
        }]
      };

      const APIGatewayMock = {

        getRestApis: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve(getRestApisResponse)
        })
      }

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';

      const APIGateway = require('../src/apiGatewayClient');
      const apiGatewayService = new APIGateway(accessKey, secretKey);


      //Act
      const getPromise = apiGatewayService.lookupApiGatewayDomainName('Test API');

      //Assert
      getPromise.then(url => {
        console.log(url);
        expect(url).to.be.equal('my***REMOVED***Id.execute-api.us-west-2.amazonaws.com');
        done();
      });
      
    });
    
    it('should return nothing if no API is found', (done) => {
      //Arrange
      const getRestApisResponse = {
        items: [{
          id: 'ciqzr3g5ti',
          name: 'Platform API'
        }, {
          id: 'my***REMOVED***Id',
          name: 'CLEARLY NOT MY API!',
          version: 'v1'
        }]
      };

      const APIGatewayMock = {

        getRestApis: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve(getRestApisResponse)
        })
      }

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';

      const APIGateway = require('../src/apiGatewayClient');
      const apiGatewayService = new APIGateway(accessKey, secretKey);


      //Act
      const getPromise = apiGatewayService.lookupApiGatewayDomainName('Test API');

      //Assert
      getPromise.then(url => {
        expect(url).to.be.null;
        done();
      });
      
    });
    
  });


  describe('lookupApiGatewayURL', () => {
    it('should return the correct url', (done) => {
      //Arrange
      const getRestApisResponse = {
        items: [{
          id: 'ciqzr3g5ti',
          name: 'Platform API'
        }, {
          id: 'my***REMOVED***Id',
          name: 'Test API',
          version: 'v1'
        }]
      };

      const getStageResponse = {
        someStageKey: 'someStageValue'
      };

      const APIGatewayMock = {

        getRestApis: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve(getRestApisResponse)
        }),

        getStage: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve(getStageResponse)
        })
      }

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';

      const APIGateway = require('../src/apiGatewayClient');
      const apiGatewayService = new APIGateway(accessKey, secretKey);


      //Act
      const getPromise = apiGatewayService.lookupApiGatewayURL('Test API', 'SomeStage');

      //Assert
      getPromise.then(url => {
        expect(url).to.be.equal('https://my***REMOVED***Id.execute-api.us-west-2.amazonaws.com/SomeStage');
        done();
      });
      
    });
    
    it('should return nothing if api is not found', (done) => {
      //Arrange
      const getRestApisResponse = {
        items: [{
          id: 'ciqzr3g5ti',
          name: 'Platform API'
        }, {
          id: 'my***REMOVED***Id',
          name: 'NOT MY TEST API',
          version: 'v1'
        }]
      };

      const getStageResponse = {
        someStageKey: 'someStageValue'
      };

      const APIGatewayMock = {

        getRestApis: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve(getRestApisResponse)
        }),

        getStage: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve(getStageResponse)
        })
      }

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';

      const APIGateway = require('../src/apiGatewayClient');
      const apiGatewayService = new APIGateway(accessKey, secretKey);


      //Act
      const getPromise = apiGatewayService.lookupApiGatewayURL('Test API', 'SomeStage');

      //Assert
      getPromise.then(url => {
        expect(url).to.be.null;
        done();
      });
      
    });
    
    
    it('should return nothing if stage is not found', (done) => {
      //Arrange
      const getRestApisResponse = {
        items: [{
          id: 'ciqzr3g5ti',
          name: 'Platform API'
        }, {
          id: 'my***REMOVED***Id',
          name: 'Test API',
          version: 'v1'
        }]
      };

      const getStageResponse = null;

      const APIGatewayMock = {

        getRestApis: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve(getRestApisResponse)
        }),

        getStage: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve(getStageResponse)
        })
      }

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';

      const APIGateway = require('../src/apiGatewayClient');
      const apiGatewayService = new APIGateway(accessKey, secretKey);


      //Act
      const getPromise = apiGatewayService.lookupApiGatewayURL('Test API', 'SomeStage');

      //Assert
      getPromise.then(url => {
        expect(url).to.be.null;
        done();
      });
      
    });
  });

});
