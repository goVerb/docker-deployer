const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const __ = require('lodash');
const BluebirdPromise = require('bluebird');
const base64 = require('base-64');
import proxyquire from 'proxyquire';



chai.use(chaiAsPromised);


describe('APIGateway Client', function() {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
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

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
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

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
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

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
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

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
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
          id: 'myAppId',
          name: 'Test API',
          version: 'v1'
        }]
      };

      const APIGatewayMock = {

        getRestApis: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve(getRestApisResponse)
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      const apiGatewayService = new APIGateway(accessKey, secretKey);


      //Act
      const getPromise = apiGatewayService.lookupApiGatewayDomainName('Test API');

      //Assert
      getPromise.then(url => {
        console.log(url);
        expect(url).to.be.equal('myAppId.execute-api.us-west-2.amazonaws.com');
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
          id: 'myAppId',
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

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
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
          id: 'myAppId',
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

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      const apiGatewayService = new APIGateway(accessKey, secretKey);


      //Act
      const getPromise = apiGatewayService.lookupApiGatewayURL('Test API', 'SomeStage');

      //Assert
      getPromise.then(url => {
        expect(url).to.be.equal('https://myAppId.execute-api.us-west-2.amazonaws.com/SomeStage');
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
          id: 'myAppId',
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

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
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
          id: 'myAppId',
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

      //Setting up APIGateway clients
      const accessKey = 'acckey';
      const secretKey = 'secret';


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
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
  describe('_overwriteSwagger', () => {
    let APIGatewayMock;
    let mockAwsSdk;
    let APIGateway;
    let apiGatewayService;

    beforeEach(() => {
      APIGatewayMock = {

        putRestApi: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve()
        })
      }

      mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');
    })

    afterEach(() => {
      APIGatewayMock = null;
      mockAwsSdk = null;
      APIGateway = null;
      apiGatewayService = null;
    })

    it('should call apiGatewayClient.putRestApi', (done) => {
      //Act
      const promiseResult = apiGatewayService._overwriteSwagger('gatewayId',{})
      //Assert
      promiseResult.then(data => {
        expect(APIGatewayMock.putRestApi.calledOnce).to.be.true;
        done();
      });
    });

    it('should pass options apiGatewayClient.putRestApi', (done) => {
      //Arrange
      let options = {
        restApiId: 'gatewayId',
        body: '{}',
        failOnWarnings: false,
        mode: 'overwrite'
      }
      //Act
      const promiseResult = apiGatewayService._overwriteSwagger('gatewayId',{})
      //Assert
      promiseResult.then(data => {
        expect(APIGatewayMock.putRestApi.args[0][0]).to.deep.equal(options);
        done();
      })
    });
  });

  describe('_createSwagger', () => {
    let APIGatewayMock;
    let mockAwsSdk;
    let APIGateway;
    let apiGatewayService;

    beforeEach(() => {
      APIGatewayMock = {

        importRestApi: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve()
        })
      }

      mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);

      apiGatewayService = new APIGateway('acckey', 'secret');
    })

    afterEach(() => {
      APIGatewayMock = null;
      mockAwsSdk = null;
      APIGateway = null;
      apiGatewayService = null;
    })

    it('should call apiGatewayClient.putRestApi', (done) => {
      //Act
      const promiseResult = apiGatewayService._createSwagger({info: {title: 'test'}})
      //Assert
      promiseResult.then(data => {
        expect(APIGatewayMock.importRestApi.calledOnce).to.be.true;
        done();
      });
    });

    it('should pass options apiGatewayClient.putRestApi', (done) => {
      //Arrange
      let options = {"body":"{\"info\":{\"title\":\"test\"}}","failOnWarnings":false}
      //Act
      const promiseResult = apiGatewayService._createSwagger({info: {title: 'test'}})
      //Assert
      promiseResult.then(data => {
        console.log(JSON.stringify(APIGatewayMock.importRestApi.args[0][0]))
        expect(APIGatewayMock.importRestApi.args[0][0]).to.deep.equal(options);
        done();
      })
    });
  });

  describe('createOrOverwriteApiSwagger', () => {
    let APIGatewayMock;
    let mockAwsSdk;
    let APIGateway;
    let apiGatewayService;

    beforeEach(() => {
      APIGatewayMock = {}

      mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');
    })

    afterEach(() => {
      APIGatewayMock = null;
      mockAwsSdk = null;
      APIGateway = null;
      apiGatewayService = null;
    })
    it('should error if no swaggerEntity is passed to it', (done) => {
      let response = apiGatewayService.createOrOverwriteApiSwagger()

      response.catch(err => {
        expect(err).to.have.property('message','swaggerEntity is null or undefined [swaggerEntity: ]')
        done();
      })
    })

    it('should error if swaggerEntity has no title', (done) => {
      let response = apiGatewayService.createOrOverwriteApiSwagger({info: {}})

      response.catch(err => {
        expect(err).to.have.property('message','swaggerEntity must contain info and title [swaggerEntity: {"info":{}}]')
        done();
      })
    })

    it('should error if swaggerEntity title is null', (done) => {
      let response = apiGatewayService.createOrOverwriteApiSwagger({info: {title: null}})

      response.catch(err => {
        expect(err).to.have.property('message','swaggerEntity.info.title is null, undefined, or empty [swaggerEntity: {"info":{"title":null}}]')
        done();
      })
    })

    it('should call lookupApiGatewayByName with the entity title', (done) => {
      apiGatewayService.lookupApiGatewayByName = sandbox.stub().returns(BluebirdPromise.resolve('IAMANID'))
      apiGatewayService._overwriteSwagger = sandbox.stub().returns(BluebirdPromise.resolve())
      let response = apiGatewayService.createOrOverwriteApiSwagger({info: {title: 'RevolverOcelot'}},0,false)

      response.then(data => {
        expect(apiGatewayService.lookupApiGatewayByName.calledOnce).to.be.true;
        done();
      })
    })
    it('should call _overwriteSwagger if name lookup returns and id', (done) => {
      apiGatewayService.lookupApiGatewayByName = sandbox.stub().returns(BluebirdPromise.resolve({id:'IAMANID'}))
      apiGatewayService._overwriteSwagger = sandbox.stub().returns(BluebirdPromise.resolve())
      let response = apiGatewayService.createOrOverwriteApiSwagger({info: {title: 'RevolverOcelot'}},0,false)

      response.then(data => {
        expect(apiGatewayService._overwriteSwagger.calledOnce).to.be.true;
        done();
      })
    })
    it('should call _createSwagger if name lookup returns no id', (done) => {
      apiGatewayService.lookupApiGatewayByName = sandbox.stub().returns(BluebirdPromise.resolve())
      apiGatewayService._createSwagger = sandbox.stub().returns(BluebirdPromise.resolve())
      let response = apiGatewayService.createOrOverwriteApiSwagger({info: {title: 'RevolverOcelot'}},0,false)

      response.then(data => {
        expect(apiGatewayService._createSwagger.calledOnce).to.be.true;
        done();
      });
    });
  });

  describe('createDeployment', () => {
    let APIGatewayMock;
    let mockAwsSdk;
    let APIGateway;
    let apiGatewayService;
    let createStub;
    let updateStub;
    beforeEach(() => {
      createStub = sandbox.stub().returns(BluebirdPromise.resolve());
      updateStub = sandbox.stub().returns(BluebirdPromise.resolve());
      APIGatewayMock = {
        createDeployment: () => ({promise: createStub}),
        updateStage: () => ({promise: updateStub})
      };

      mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };
    });

    afterEach(() => {
      APIGatewayMock = null;
      mockAwsSdk = null;
      APIGateway = null;
      apiGatewayService = null;
      createStub = null;
      updateStub = null;
    });

    it('should error if no id is passed to it', (done) => {
      //Arrange
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');
      //Act
      let response = apiGatewayService.createDeployment(null,'IAMSTAGE',{variable: 'amvar'});
      //Assert
      response.catch(err => {
        expect(err.name).to.equal('Error');
        expect(err.message).to.equal("restApiId must be populated");
        done();
      });
    });
    it('should error if no stagename is passed to it', (done) => {
      //Arrange
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');
      //Act
      let response = apiGatewayService.createDeployment('IAMANID',null,{variable: 'amvar'});
      //Assert
      response.catch(err => {
        expect(err.name).to.equal('Error');
        expect(err.message).to.equal('stageName must be populated');
        done();
      });
    });
    it('should error if no variableCollection is passed to it', () => {
      //Arrange
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');
      //Act
      let response = apiGatewayService.createDeployment('IAMANID','IAMSTAGE',[]);
      //Assert
      return response.catch(err => {
        expect(err.name).to.equal('Error');
        expect(err.message).to.equal("variableCollection must be populated");
      });
    });

    it('should call createDeployment from apiGatewayClient once', () => {
      //Arrange
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');

      //Act
      let response = apiGatewayService.createDeployment('IAMANID','IAMSTAGE',{variable: 'amvar'});

      //Assert
      return response.then(data => {
        expect(createStub.calledOnce).to.be.true;
      });
    });

    it('should call updateStage from apiGatewayClient once', () => {
      //Arrange
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');
      //Act
      let response = apiGatewayService.createDeployment('IAMANID','IAMSTAGE',{variable: 'amvar'});
      //Assert
      return response.then(data => {
        expect(updateStub.calledOnce).to.be.true;
      });
    });

    it('should throw an error if the api throws one', () => {
      //Arrange
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');
      apiGatewayService.createDeployment = sandbox.stub().rejects(new Error('You got an error'));

      //Act
      let response = apiGatewayService.createDeployment('IAMANID','IAMSTAGE',{variable: 'amvar'});

      //Assert
      return response.then(() => {
        expect().fail();
      }).catch(err => {
        console.log(err)
        expect(err).to.have.property('message', 'You got an error');
      });
    });
  });

  describe('_deployApiGatewaytoStage', () => {

    let APIGatewayMock;
    let mockAwsSdk;
    let APIGateway;
    let apiGatewayService;
    let createStub;
    beforeEach(() => {
      createStub = sandbox.stub().returns(BluebirdPromise.resolve());
      APIGatewayMock = {
        createDeployment: () => ({promise: createStub}),
      };

      mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }

      };
    });

    afterEach(() => {
      APIGatewayMock = null;
      mockAwsSdk = null;
      APIGateway = null;
      apiGatewayService = null;
      createStub = null;
    });

    it('should throw an error if no apiGatewayId is passed', async () => {
      //Arrange
      const idParam = null;
      const stageNameParam = 'iAmTheStageName';
      const stageFullNameParam = 'iAmTheStageFullName';
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStage(idParam, stageNameParam, stageFullNameParam);
      } catch (err) {
        // Assert
        expect(err.name).to.be.equal('Error');
        expect(err.message).to.be.equal('apiGatewayId is null or undefined')
      }
    });

    it('should throw an error if no stageName is passed', async () => {
      //Arrange
      const idParam = 'iAmTheId';
      const stageNameParam = null;
      const stageFullNameParam = 'iAmTheStageFullName';
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStage(idParam, stageNameParam, stageFullNameParam);
      } catch (err) {
        // Assert
        expect(err.name).to.be.equal('Error');
        expect(err.message).to.be.equal('stageName is null or undefined')
      }
    });

    it('should throw an error if no stageFullName is passed', async () => {
      //Arrange
      const idParam = 'iAmTheId';
      const stageNameParam = 'iAmTheStageName';
      const stageFullNameParam = null;
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStage(idParam, stageNameParam, stageFullNameParam);
      } catch (err) {
        // Assert
        expect(err.name).to.be.equal('Error');
        expect(err.message).to.be.equal('stageFullName is null or undefined')
      }
    });

    it('should call apiGatewayClient.createDeployment once', async () => {
      //Arrange
      const idParam = 'iAmTheId';
      const stageNameParam = 'iAmTheStageName';
      const stageFullNameParam = 'iAmTheStageFullName';
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');

      // Act
      await apiGatewayService._deployApiGatewayToStage(idParam, stageNameParam, stageFullNameParam);

      // Assert
      expect(createStub.callCount).to.be.equal(1);
    });

    it('should throw error if AWS SDK throws one', async () => {
      //Arrange
      const idParam = 'iAmTheId';
      const stageNameParam = 'iAmTheStageName';
      const stageFullNameParam = 'iAmTheStageFullName';
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      createStub = sandbox.stub().rejects(new Error('AWS SDK Error'));
      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStage(idParam, stageNameParam, stageFullNameParam);
      } catch (err) {
        // Assert
        expect(err.name).to.be.equal('Error');
        expect(err.message).to.be.equal('AWS SDK Error');
      }
    });
  });

  describe('deployApiGatewayToStageForEnvByGatewayName', () => {
    let APIGatewayMock;
    let mockAwsSdk;
    let APIGateway;
    let apiGatewayService;
    let createStub;
    let getRestApisStub;
    let updateStub;
    let mocks;
    beforeEach(() => {
      createStub = sandbox.stub().resolves({});
      getRestApisStub = sandbox.stub().resolves({});
      updateStub = sandbox.stub().resolves({});

      APIGatewayMock = {
        createDeployment: () => ({ promise: createStub }),
        getRestApis: () => ({ promise: getRestApisStub} ),
        updateStage: () => ({ promise: updateStub })
      };

      mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        APIGateway: () => {
          return APIGatewayMock;
        }
      };

      mocks = {
        'aws-sdk': mockAwsSdk
      };

      APIGateway = proxyquire('../src/apiGatewayClient', mocks);
      apiGatewayService = new APIGateway('acckey', 'secret');
    });

    afterEach(() => {
      APIGatewayMock = null;
      mockAwsSdk = null;
      APIGateway = null;
      apiGatewayService = null;
      createStub = null;
    });

    it('should throw an error if environment is null or undefined', async () => {
      // Arrange
      const environment = null;

      const apiName = 'myApi';

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName)

      } catch (err) {

        // Assert
        expect(err.plugin).to.be.equal('deployApiGatewayToStageForEnvByGatewayName');
        expect(err.message).to.be.equal(`environment is not valid [environment: ]`);
      }
    });

    it('should throw an error if environment.FullName is null or undefined', async () => {
      // Arrange
      const environment = {
        FullName: null,
        ShortName: 'myEnv'
      };

      const apiName = 'myApi';

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName)

      } catch (err) {

        // Assert
        expect(err.plugin).to.be.equal('deployApiGatewayToStageForEnvByGatewayName');
        expect(err.message).to.be.equal(`environment is not valid [environment: ${JSON.stringify(environment)}]`);
      }
    });

    it('should throw an error if environment.FullName is unknown', async () => {
      // Arrange
      const environment = {
        FullName: 'UNK',
        ShortName: 'myEnv'
      };

      const apiName = 'myApi';

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName)

      } catch (err) {

        // Assert
        expect(err.plugin).to.be.equal('deployApiGatewayToStageForEnvByGatewayName');
        expect(err.message).to.be.equal(`environment is not valid [environment: ${JSON.stringify(environment)}]`);
      }
    });

    it('should throw an error if environment.ShortName is null or undefined', async () => {
      // Arrange
      const environment = {
        FullName: 'myEnvironment',
        ShortName: null
      };

      const apiName = 'myApi';

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName)

      } catch (err) {

        // Assert
        expect(err.plugin).to.be.equal('deployApiGatewayToStageForEnvByGatewayName');
        expect(err.message).to.be.equal(`environment is not valid [environment: ${JSON.stringify(environment)}]`);
      }
    });

    it('should throw an error if environment.ShortName is unknown', async () => {
      // Arrange
      const environment = {
        FullName: 'myEnvironment',
        ShortName: 'UNK'
      };

      const apiName = 'myApi';

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName)

      } catch (err) {

        // Assert
        expect(err.plugin).to.be.equal('deployApiGatewayToStageForEnvByGatewayName');
        expect(err.message).to.be.equal(`environment is not valid [environment: ${JSON.stringify(environment)}]`);
      }
    });

    it('should throw an error if apiName is falsy value', async () => {
      // Arrange
      const environment = {
        FullName: 'myEnvironment',
        ShortName: 'myEnv'
      };

      const apiName = '';

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName)

      } catch (err) {

        // Assert
        expect(err.plugin).to.be.equal('deployApiGatewayToStageForEnvByGatewayName');
        expect(err.message).to.be.equal(`apiName is null or undefined`);
      }
    });

    it('should call lookupApiGatewayByName once', async () => {
      // Arrange
      apiGatewayService.lookupApiGatewayByName = sandbox.stub().returns(BluebirdPromise.resolve(null));

      const environment = {
        FullName: 'myEnvironment',
        ShortName: 'myEnv'
      };

      const apiName = 'myAPI';

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName, 0);
      } catch (err) {

        // Assert
        expect(apiGatewayService.lookupApiGatewayByName.callCount).to.be.equal(1);
      }
    });

    it('should throw an error if no apiId is found by lookupApiGatewayByName', async () => {
      // Arrange
      apiGatewayService.lookupApiGatewayByName = sandbox.stub().returns(BluebirdPromise.resolve(null));

      const environment = {
        FullName: 'myEnvironment',
        ShortName: 'myEnv'
      };

      const apiName = 'myAPI';

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName, 0);
      } catch (err) {

        // Assert
        expect(err.plugin).to.be.equal('deployApiGatewayToStageForEnvByGatewayName');
        expect(err.message).to.be.equal('foundApiId is null or undefined (no match found)');
      }
    });

    it('should call _deployApiGatewayToStage once', async () => {
      // Arrange
      apiGatewayService.lookupApiGatewayByName = sandbox.stub().returns(BluebirdPromise.resolve('apiName'));
      apiGatewayService._deployApiGatewayToStage = sandbox.stub().returns(BluebirdPromise.resolve(null));

      const environment = {
        FullName: 'myEnvironment',
        ShortName: 'myEnv'
      };

      const apiName = 'myAPI';

      // Act
      await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName, 0);

      // Assert
      expect(apiGatewayService._deployApiGatewayToStage.callCount).to.be.equal(1);
    });


    it('should pass params to _deployApiGatewayToStage', async () => {
      // Arrange
      apiGatewayService.lookupApiGatewayByName = sandbox.stub().returns(BluebirdPromise.resolve('apiName'));
      apiGatewayService._deployApiGatewayToStage = sandbox.stub().returns(BluebirdPromise.resolve(null));

      const environment = {
        FullName: 'myEnvironment',
        ShortName: 'myEnv'
      };

      const apiName = 'myAPI';

      // Act
      await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName, 0);

      // Assert
      expect(apiGatewayService._deployApiGatewayToStage.args[0][0]).to.be.equal('apiName');
      expect(apiGatewayService._deployApiGatewayToStage.args[0][1]).to.be.equal(environment.ShortName);
      expect(apiGatewayService._deployApiGatewayToStage.args[0][2]).to.be.equal(environment.FullName);
    });

    it('should thrown an error if _deployApiGatewayToStage errors', async () => {
      // Arrange
      apiGatewayService.lookupApiGatewayByName = sandbox.stub().returns(BluebirdPromise.resolve('apiName'));
      apiGatewayService._deployApiGatewayToStage = sandbox.stub().returns(BluebirdPromise.reject());

      const environment = {
        FullName: 'myEnvironment',
        ShortName: 'myEnv'
      };

      const apiName = 'myAPI';

      // Act
      try {
        await apiGatewayService._deployApiGatewayToStageForEnvByGatewayName(environment, apiName, 0);
      } catch (err) {
        expect(err.plugin).to.be.equal('deployApiGatewayToStageForEnvByGatewayName');
      }
    });
  });
});
