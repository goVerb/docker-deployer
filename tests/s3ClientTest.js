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


describe('S3 Client', function() {
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


  describe('getter _awsS3Client', () => {
    it('should pass accessKey and secretKey to S3 client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';

      const S3 = require('../src/s3Client');
      const s3ClientService = new S3(accessKey, secretKey);


      //Act
      s3ClientService._awsS3Client;

      //Assert
      let params = mockAwsSdk.S3.args[0][0];
      expect(params.accessKeyId).to.equal(accessKey);
      expect(params.secretAccessKey).to.equal(secretKey);
    });
  });


  describe('LookupS3BucketByName', () => {
    it('should pass no params to createBucket', () => {
      //Arrange

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        listBuckets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({Buckets: []})
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();

      let s3BucketName = 'fake';

      //Act
      let resultPromise = s3ClientService.LookupS3BucketByName(s3BucketName);

      //Assert
      return resultPromise.then(() => {
        let params = awsS3ServiceMock.listBuckets.args[0][0];
        expect(params).to.be.equal();
      });
    });

    it('should return an empty object if listBuckets resolves an empty list for the Buckets object', () => {
      //Arrange

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        listBuckets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({ Buckets: [] })
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();

      let s3BucketName = 'fake';

      //Act
      let resultPromise = s3ClientService.LookupS3BucketByName(s3BucketName);

      //Assert
      return resultPromise.then(res => {
        expect(res).to.be.deep.equal({});
      });
    });

    it('should return the bucket if listBuckets resolves a list with a matching bucket', () => {
      //Arrange

      let s3BucketName = 'fake';

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        listBuckets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({ Buckets: [{ Name: s3BucketName }] })
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();



      //Act
      let resultPromise = s3ClientService.LookupS3BucketByName(s3BucketName);

      //Assert
      return resultPromise.then(res => {
        expect(res).to.be.deep.equal({ Name: s3BucketName });
      });
    });

    it('should return an undefined if listBuckets resolves a list without a matching bucket', () => {
      //Arrange

      let s3BucketName = 'fake';

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        listBuckets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({ Buckets: [{ Name: 'notFake' }] })
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();



      //Act
      let resultPromise = s3ClientService.LookupS3BucketByName(s3BucketName);

      //Assert
      return resultPromise.then(res => {
        expect(res).to.be.deep.equal();
      });
    });
  });


  describe('createBucket', () => {
    it('should pass params to createBucket', () => {
      //Arrange

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        createBucket: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve()
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();
      s3ClientService._region = 'us-west-2';

      let s3BucketName = 'fake';

      let expectedParams = {
        Bucket: s3BucketName,
        CreateBucketConfiguration: {
          LocationConstraint: s3ClientService._region
        }
      };

      //Act
      let resultPromise = s3ClientService.createBucket(s3BucketName);

      //Assert
      return resultPromise.then(() => {
        let params = awsS3ServiceMock.createBucket.args[0][0];
        expect(params).to.be.deep.equal(expectedParams);
      });
    });

    it('should return the object resolved by awsS3Service.createBucket', () => {
      //Arrange
      let expectedResponse = {fake: 'object'};

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        createBucket: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(expectedResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();
      s3ClientService._region = 'us-west-2';

      let s3BucketName = 'fake';

      let expectedParams = {
        Bucket: s3BucketName,
        CreateBucketConfiguration: {
          LocationConstraint: s3ClientService._region
        }
      };

      //Act
      let resultPromise = s3ClientService.createBucket(s3BucketName);

      //Assert
      return resultPromise.then(res => {

        expect(res).to.be.deep.equal(expectedResponse);
      });
    });

    it('should return the message rejected by awsS3Service.createBucket', () => {
      //Arrange
      let expectedResponse = {fake: 'object'};

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        createBucket: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.reject(expectedResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();
      s3ClientService._region = 'us-west-2';

      let s3BucketName = 'fake';

      let expectedWrappedResponse = { message: `Error: ${JSON.stringify(expectedResponse)} | Error Stack Trace: undefined` };

      //Act
      let resultPromise = s3ClientService.createBucket(s3BucketName);

      //Assert
      return resultPromise.then(err => {

        expect(err).to.be.deep.equal(expectedWrappedResponse);
      });
    });

  });


  describe('enableHosting', () => {
    it('should pass params to enableHosting', () => {
      //Arrange

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        putBucketWebsite: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve()
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();
      s3ClientService._region = 'us-west-2';

      let s3BucketName = 'fake';

      let expectedParams = {
        Bucket: s3BucketName, /* required */
        WebsiteConfiguration: { /* required */
          ErrorDocument: {
            Key: 'index.html' /* required */
          },
          IndexDocument: {
            Suffix: 'index.html' /* required */
          }
        }
      };

      //Act
      let resultPromise = s3ClientService.enableHosting(s3BucketName);

      //Assert
      return resultPromise.then(() => {
        let params = awsS3ServiceMock.putBucketWebsite.args[0][0];
        expect(params).to.be.deep.equal(expectedParams);
      });
    });

    it('should respond with object resolved by putBucketWebsite', () => {
      //Arrange
      let expectedResp = {fake: 'object'};

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        putBucketWebsite: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(expectedResp)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();
      s3ClientService._region = 'us-west-2';

      let s3BucketName = 'fake';

      //Act
      let resultPromise = s3ClientService.enableHosting(s3BucketName);

      //Assert
      return resultPromise.then(res => {
        expect(res).to.be.deep.equal(expectedResp);
      });
    });

    it('should respond with object rejected by putBucketWebsite', () => {
      //Arrange
      let expectedResp = {fake: 'object'};

      //setting up s3ServiceClient Mock
      let awsS3ServiceMock = {
        putBucketWebsite: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.reject(expectedResp)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        S3: () => {
          return awsS3ServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const S3 = require('../src/s3Client');
      const s3ClientService = new S3();
      s3ClientService._region = 'us-west-2';

      let s3BucketName = 'fake';

      let expectedWrappedResponse = { message: `Error: ${JSON.stringify(expectedResp)} | Error Stack Trace: undefined` };

      //Act
      let resultPromise = s3ClientService.enableHosting(s3BucketName);

      //Assert
      return resultPromise.then(res => {
        expect(res).to.be.deep.equal(expectedWrappedResponse);
      });
    });
  });


});