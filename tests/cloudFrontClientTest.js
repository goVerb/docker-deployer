"use strict";

const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const mockery = require('mockery');
const __ = require('lodash');
const BluebirdPromise = require('bluebird');


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


  describe('getter _awsCloudFrontClient', () => {
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
      cloudFrontClientService._awsCloudFrontClient;

      //Assert
      let params = mockAwsSdk.CloudFront.args[0][0];
      expect(params.accessKeyId).to.equal(accessKey);
      expect(params.secretAccessKey).to.equal(secretKey);
    });
  });

  describe('createCloudFrontDistribution', () => {
    it('should call _getDistributionByCName once', () => {
      //Arrange
      let listDistributionsResponse = {};

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        listDistributions: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listDistributionsResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let createdDistribution = {
        Id: 'something'
      };
      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves(createdDistribution);
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        apiGatewayId: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService.createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(cloudFrontClientService._getDistributionByCName.calledOnce).to.be.true;
      });
    });

    it('should NOT call _createCloudFrontDistribution when distribution exist', () => {
      //Arrange
      let listDistributionsResponse = {};

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        listDistributions: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listDistributionsResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let createdDistribution = {
        Id: 'something'
      };
      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves(createdDistribution);
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        apiGatewayId: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService.createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(cloudFrontClientService._createCloudFrontDistribution.callCount).to.be.equal(0);
      });
    });

    it('should call _createCloudFrontDistribution once when distribution doesnt exist', () => {
      //Arrange
      let listDistributionsResponse = {};

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        listDistributions: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listDistributionsResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves({});
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves({});


      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        apiGatewayId: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService.createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(cloudFrontClientService._createCloudFrontDistribution.callCount).to.be.equal(1);
      });
    });

    it('should pass parameters to _createCloudFrontDistribution when distribution doesnt exist', () => {
      //Arrange
      let listDistributionsResponse = {};

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        listDistributions: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listDistributionsResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves({});
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves({});

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService.createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(cloudFrontClientService._createCloudFrontDistribution.args[0][0]).to.be.deep.equal(cloudFrontDistributionParams);
      });
    });
  });

  describe('_createCloudFrontDistribution', () => {
    it('pass params.callerReference to createDistribution method', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.createDistribution.args[0][0];
        expect(params.DistributionConfig.CallerReference).to.be.equal(cloudFrontDistributionParams.callerReference);
      });

    });

    it('pass params.cname to createDistribution method', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createDistributionResponse)} }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.createDistribution.args[0][0];
        expect(params.DistributionConfig.Aliases.Items[0]).to.be.equal(cloudFrontDistributionParams.cname);
      });
    });

    it('pass params.comment to createDistribution method', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createDistributionResponse)} }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.createDistribution.args[0][0];
        expect(params.DistributionConfig.Comment).to.be.equal(cloudFrontDistributionParams.comment);
      });
    });

    it('pass params.originName to createDistribution method', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createDistributionResponse)} }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.createDistribution.args[0][0];

        expect(params.DistributionConfig.DefaultCacheBehavior.TargetOriginId).to.be.equal(cloudFrontDistributionParams.originName);

        expect(params.DistributionConfig.Origins.Items[0].Id).to.be.equal(cloudFrontDistributionParams.originName);

        expect(params.DistributionConfig.CacheBehaviors.Items[0].TargetOriginId).to.be.equal(cloudFrontDistributionParams.originName);
      });
    });

    it('pass params.originDomainName to createDistribution method', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createDistributionResponse)} }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.createDistribution.args[0][0];

        expect(params.DistributionConfig.Origins.Items[0].DomainName).to.be.equal(cloudFrontDistributionParams.originDomainName);
      });
    });

    it('pass params.originPath to createDistribution method', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createDistributionResponse)} }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        apiGatewayId: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.createDistribution.args[0][0];

        expect(params.DistributionConfig.Origins.Items[0].OriginPath).to.be.equal(cloudFrontDistributionParams.originPath);

        expect(params.DistributionConfig.CacheBehaviors.Items[0].PathPattern).to.be.equal(cloudFrontDistributionParams.originPath);
      });
    });
    
    it('should add a ViewerCertificate if acmCertArn is provided', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createDistributionResponse)} }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      const cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        apiGatewayId: 'ajkfdljsfkdal',
        originPath: '/',
        acmCertArn: "myCertArn"
      };
      
      //Act
      const resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        const params = awsCloudFrontServiceMock.createDistribution.args[0][0];
        expect(params.DistributionConfig.ViewerCertificate).to.deep.equal({
          ACMCertificateArn: cloudFrontDistributionParams.acmCertArn,
          CertificateSource: 'acm',
          MinimumProtocolVersion: 'TLSv1',
          SSLSupportMethod: 'sni-only'
        });
      });
    });

    it('should pass distributionId to waitFor method', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createDistributionResponse)} }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(awsCloudFrontServiceMock.waitFor.args[0][1].Id).to.be.equal(createDistributionResponse.Distribution.Id);
      });
    });

    it('should pass resourceWaiter to waitFor method', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createDistributionResponse)} }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(awsCloudFrontServiceMock.waitFor.args[0][0]).to.be.equal('distributionDeployed');
      });
    });

    it('should call waitFor once', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createDistributionResponse)} }),
        waitFor: sandbox.stub().returns({ promise: () => { return BluebirdPromise.resolve({}) } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cloudFrontDistributionParams = {
        callerReference: 'testAndUnique1',
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(awsCloudFrontServiceMock.waitFor.calledOnce).to.be.true;
      });
    });
  });

  describe('_getDistributionByCName', () => {
    it('should call listDistributions method once', () => {
      //Arrange
      let listDistributionsResponse = {};

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        listDistributions: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listDistributionsResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cname = 'applesauce.example.com';

      //Act
      let resultPromise = cloudFrontClientService._getDistributionByCName(cname);

      //Assert
      return resultPromise.then(() => {
        expect(awsCloudFrontServiceMock.listDistributions.calledOnce).to.be.true;
      });
    });

    it('should return first distribution if cname matches any of the Aliseses', () => {
      //Arrange
      let listDistributionsResponse = {
        "DistributionList": {
          "Marker": "",
          "MaxItems": 100,
          "IsTruncated": false,
          "Quantity": 3,
          "Items": [
            {
              "Id": "12312312",
              "ARN": "arn:aws:cloudfront::1312:distribution/AREF",
              "Status": "Deployed",
              "LastModifiedTime": "2014-01-09T13:13:41.629Z",
              "DomainName": "abc.cloudfront.net",
              "Aliases": {
                "Quantity": 1,
                "Items": [
                  "stuff.example.com"
                ]
              },
              "Origins": {
                "Quantity": 1,
                "Items": [
                  {
                    "Id": "S3-go***REMOVED***-www-wp-content",
                    "DomainName": "go***REMOVED***-prod-www-wp-content.s3.amazonaws.com",
                    "OriginPath": "",
                    "CustomHeaders": {
                      "Quantity": 0,
                      "Items": []
                    },
                    "S3OriginConfig": {
                      "OriginAccessIdentity": ""
                    }
                  }
                ]
              },
              "DefaultCacheBehavior": {
                "TargetOriginId": "S3-go***REMOVED***-www-wp-content",
                "ForwardedValues": {
                  "QueryString": false,
                  "Cookies": {
                    "Forward": "none"
                  },
                  "Headers": {
                    "Quantity": 0,
                    "Items": []
                  },
                  "QueryStringCacheKeys": {
                    "Quantity": 0,
                    "Items": []
                  }
                },
                "TrustedSigners": {
                  "Enabled": false,
                  "Quantity": 0,
                  "Items": []
                },
                "ViewerProtocolPolicy": "allow-all",
                "MinTTL": 0,
                "AllowedMethods": {
                  "Quantity": 2,
                  "Items": [
                    "HEAD",
                    "GET"
                  ],
                  "CachedMethods": {
                    "Quantity": 2,
                    "Items": [
                      "HEAD",
                      "GET"
                    ]
                  }
                },
                "SmoothStreaming": false,
                "DefaultTTL": 86400,
                "MaxTTL": 31536000,
                "Compress": false,
                "LambdaFunctionAssociations": {
                  "Quantity": 0,
                  "Items": []
                }
              },
              "CacheBehaviors": {
                "Quantity": 0,
                "Items": []
              },
              "CustomErrorResponses": {
                "Quantity": 0,
                "Items": []
              },
              "Comment": "",
              "PriceClass": "PriceClass_All",
              "Enabled": true,
              "ViewerCertificate": {
                "CloudFrontDefaultCertificate": true,
                "MinimumProtocolVersion": "SSLv3",
                "CertificateSource": "cloudfront"
              },
              "Restrictions": {
                "GeoRestriction": {
                  "RestrictionType": "none",
                  "Quantity": 0,
                  "Items": []
                }
              },
              "WebACLId": ""
            },
            {
              "Id": "fdsa",
              "ARN": "arn:aws:cloudfront::***REMOVED***:distribution/REREF",
              "Status": "Deployed",
              "LastModifiedTime": "2013-08-05T17:52:03.220Z",
              "DomainName": "d23lkb2zft31e.cloudfront.net",
              "Aliases": {
                "Quantity": 1,
                "Items": [
                  "applesauce.example.com"
                ]
              },
              "Origins": {
                "Quantity": 1,
                "Items": [
                  {
                    "Id": "S3-go***REMOVED***-dev-www-wp-content",
                    "DomainName": "go***REMOVED***-dev-www-wp-content.s3.amazonaws.com",
                    "OriginPath": "",
                    "CustomHeaders": {
                      "Quantity": 0,
                      "Items": []
                    },
                    "S3OriginConfig": {
                      "OriginAccessIdentity": ""
                    }
                  }
                ]
              },
              "DefaultCacheBehavior": {
                "TargetOriginId": "S3-go***REMOVED***-dev-www-wp-content",
                "ForwardedValues": {
                  "QueryString": false,
                  "Cookies": {
                    "Forward": "none"
                  },
                  "Headers": {
                    "Quantity": 0,
                    "Items": []
                  },
                  "QueryStringCacheKeys": {
                    "Quantity": 0,
                    "Items": []
                  }
                },
                "TrustedSigners": {
                  "Enabled": false,
                  "Quantity": 0,
                  "Items": []
                },
                "ViewerProtocolPolicy": "allow-all",
                "MinTTL": 0,
                "AllowedMethods": {
                  "Quantity": 2,
                  "Items": [
                    "HEAD",
                    "GET"
                  ],
                  "CachedMethods": {
                    "Quantity": 2,
                    "Items": [
                      "HEAD",
                      "GET"
                    ]
                  }
                },
                "SmoothStreaming": false,
                "DefaultTTL": 86400,
                "MaxTTL": 31536000,
                "Compress": false,
                "LambdaFunctionAssociations": {
                  "Quantity": 0,
                  "Items": []
                }
              },
              "CacheBehaviors": {
                "Quantity": 0,
                "Items": []
              },
              "CustomErrorResponses": {
                "Quantity": 0,
                "Items": []
              },
              "Comment": "",
              "PriceClass": "PriceClass_All",
              "Enabled": true,
              "ViewerCertificate": {
                "CloudFrontDefaultCertificate": true,
                "MinimumProtocolVersion": "SSLv3",
                "CertificateSource": "cloudfront"
              },
              "Restrictions": {
                "GeoRestriction": {
                  "RestrictionType": "none",
                  "Quantity": 0,
                  "Items": []
                }
              },
              "WebACLId": ""
            },
            {
              "Id": "KILM",
              "ARN": "arn:aws:cloudfront::1321321321:distribution/REFDE1",
              "Status": "Deployed",
              "LastModifiedTime": "2016-04-06T20:41:21.730Z",
              "DomainName": "d3tdpo6iwhiw09.cloudfront.net",
              "Aliases": {
                "Quantity": 1,
                "Items": [
                  "grapes.example.com"
                ]
              },
              "Origins": {
                "Quantity": 1,
                "Items": [
                  {
                    "Id": "S3-go***REMOVED***-dev-app-content",
                    "DomainName": "go***REMOVED***-dev-app-content.s3.amazonaws.com",
                    "OriginPath": "",
                    "CustomHeaders": {
                      "Quantity": 0,
                      "Items": []
                    },
                    "S3OriginConfig": {
                      "OriginAccessIdentity": ""
                    }
                  }
                ]
              },
              "DefaultCacheBehavior": {
                "TargetOriginId": "S3-go***REMOVED***-dev-app-content",
                "ForwardedValues": {
                  "QueryString": false,
                  "Cookies": {
                    "Forward": "none"
                  },
                  "Headers": {
                    "Quantity": 0,
                    "Items": []
                  },
                  "QueryStringCacheKeys": {
                    "Quantity": 0,
                    "Items": []
                  }
                },
                "TrustedSigners": {
                  "Enabled": false,
                  "Quantity": 0,
                  "Items": []
                },
                "ViewerProtocolPolicy": "allow-all",
                "MinTTL": 0,
                "AllowedMethods": {
                  "Quantity": 2,
                  "Items": [
                    "HEAD",
                    "GET"
                  ],
                  "CachedMethods": {
                    "Quantity": 2,
                    "Items": [
                      "HEAD",
                      "GET"
                    ]
                  }
                },
                "SmoothStreaming": false,
                "DefaultTTL": 86400,
                "MaxTTL": 31536000,
                "Compress": false,
                "LambdaFunctionAssociations": {
                  "Quantity": 0,
                  "Items": []
                }
              },
              "CacheBehaviors": {
                "Quantity": 0,
                "Items": []
              },
              "CustomErrorResponses": {
                "Quantity": 0,
                "Items": []
              },
              "Comment": "",
              "PriceClass": "PriceClass_All",
              "Enabled": true,
              "ViewerCertificate": {
                "CloudFrontDefaultCertificate": true,
                "MinimumProtocolVersion": "SSLv3",
                "CertificateSource": "cloudfront"
              },
              "Restrictions": {
                "GeoRestriction": {
                  "RestrictionType": "none",
                  "Quantity": 0,
                  "Items": []
                }
              },
              "WebACLId": ""
            }
          ]
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        listDistributions: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listDistributionsResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cname = 'applesauce.example.com';

      //Act
      let resultPromise = cloudFrontClientService._getDistributionByCName(cname);

      //Assert
      return resultPromise.then(result => {
        expect(result.Id).to.be.equal('fdsa');
      });
    });

    it('should return empty object if no distribution contains the cname Alias', () => {
      //Arrange
      let listDistributionsResponse = {
        "DistributionList": {
          "Marker": "",
          "MaxItems": 100,
          "IsTruncated": false,
          "Quantity": 3,
          "Items": [
            {
              "Id": "12312312",
              "ARN": "arn:aws:cloudfront::1312:distribution/AREF",
              "Status": "Deployed",
              "LastModifiedTime": "2014-01-09T13:13:41.629Z",
              "DomainName": "abc.cloudfront.net",
              "Aliases": {
                "Quantity": 1,
                "Items": [
                  "stuff.example.com"
                ]
              },
              "Origins": {
                "Quantity": 1,
                "Items": [
                  {
                    "Id": "S3-go***REMOVED***-www-wp-content",
                    "DomainName": "go***REMOVED***-prod-www-wp-content.s3.amazonaws.com",
                    "OriginPath": "",
                    "CustomHeaders": {
                      "Quantity": 0,
                      "Items": []
                    },
                    "S3OriginConfig": {
                      "OriginAccessIdentity": ""
                    }
                  }
                ]
              },
              "DefaultCacheBehavior": {
                "TargetOriginId": "S3-go***REMOVED***-www-wp-content",
                "ForwardedValues": {
                  "QueryString": false,
                  "Cookies": {
                    "Forward": "none"
                  },
                  "Headers": {
                    "Quantity": 0,
                    "Items": []
                  },
                  "QueryStringCacheKeys": {
                    "Quantity": 0,
                    "Items": []
                  }
                },
                "TrustedSigners": {
                  "Enabled": false,
                  "Quantity": 0,
                  "Items": []
                },
                "ViewerProtocolPolicy": "allow-all",
                "MinTTL": 0,
                "AllowedMethods": {
                  "Quantity": 2,
                  "Items": [
                    "HEAD",
                    "GET"
                  ],
                  "CachedMethods": {
                    "Quantity": 2,
                    "Items": [
                      "HEAD",
                      "GET"
                    ]
                  }
                },
                "SmoothStreaming": false,
                "DefaultTTL": 86400,
                "MaxTTL": 31536000,
                "Compress": false,
                "LambdaFunctionAssociations": {
                  "Quantity": 0,
                  "Items": []
                }
              },
              "CacheBehaviors": {
                "Quantity": 0,
                "Items": []
              },
              "CustomErrorResponses": {
                "Quantity": 0,
                "Items": []
              },
              "Comment": "",
              "PriceClass": "PriceClass_All",
              "Enabled": true,
              "ViewerCertificate": {
                "CloudFrontDefaultCertificate": true,
                "MinimumProtocolVersion": "SSLv3",
                "CertificateSource": "cloudfront"
              },
              "Restrictions": {
                "GeoRestriction": {
                  "RestrictionType": "none",
                  "Quantity": 0,
                  "Items": []
                }
              },
              "WebACLId": ""
            },
            {
              "Id": "fdsa",
              "ARN": "arn:aws:cloudfront::***REMOVED***:distribution/REREF",
              "Status": "Deployed",
              "LastModifiedTime": "2013-08-05T17:52:03.220Z",
              "DomainName": "d23lkb2zft31e.cloudfront.net",
              "Aliases": {
                "Quantity": 1,
                "Items": [
                  "applesauce.example.com"
                ]
              },
              "Origins": {
                "Quantity": 1,
                "Items": [
                  {
                    "Id": "S3-go***REMOVED***-dev-www-wp-content",
                    "DomainName": "go***REMOVED***-dev-www-wp-content.s3.amazonaws.com",
                    "OriginPath": "",
                    "CustomHeaders": {
                      "Quantity": 0,
                      "Items": []
                    },
                    "S3OriginConfig": {
                      "OriginAccessIdentity": ""
                    }
                  }
                ]
              },
              "DefaultCacheBehavior": {
                "TargetOriginId": "S3-go***REMOVED***-dev-www-wp-content",
                "ForwardedValues": {
                  "QueryString": false,
                  "Cookies": {
                    "Forward": "none"
                  },
                  "Headers": {
                    "Quantity": 0,
                    "Items": []
                  },
                  "QueryStringCacheKeys": {
                    "Quantity": 0,
                    "Items": []
                  }
                },
                "TrustedSigners": {
                  "Enabled": false,
                  "Quantity": 0,
                  "Items": []
                },
                "ViewerProtocolPolicy": "allow-all",
                "MinTTL": 0,
                "AllowedMethods": {
                  "Quantity": 2,
                  "Items": [
                    "HEAD",
                    "GET"
                  ],
                  "CachedMethods": {
                    "Quantity": 2,
                    "Items": [
                      "HEAD",
                      "GET"
                    ]
                  }
                },
                "SmoothStreaming": false,
                "DefaultTTL": 86400,
                "MaxTTL": 31536000,
                "Compress": false,
                "LambdaFunctionAssociations": {
                  "Quantity": 0,
                  "Items": []
                }
              },
              "CacheBehaviors": {
                "Quantity": 0,
                "Items": []
              },
              "CustomErrorResponses": {
                "Quantity": 0,
                "Items": []
              },
              "Comment": "",
              "PriceClass": "PriceClass_All",
              "Enabled": true,
              "ViewerCertificate": {
                "CloudFrontDefaultCertificate": true,
                "MinimumProtocolVersion": "SSLv3",
                "CertificateSource": "cloudfront"
              },
              "Restrictions": {
                "GeoRestriction": {
                  "RestrictionType": "none",
                  "Quantity": 0,
                  "Items": []
                }
              },
              "WebACLId": ""
            },
            {
              "Id": "KILM",
              "ARN": "arn:aws:cloudfront::1321321321:distribution/REFDE1",
              "Status": "Deployed",
              "LastModifiedTime": "2016-04-06T20:41:21.730Z",
              "DomainName": "d3tdpo6iwhiw09.cloudfront.net",
              "Aliases": {
                "Quantity": 1,
                "Items": [
                  "grapes.example.com"
                ]
              },
              "Origins": {
                "Quantity": 1,
                "Items": [
                  {
                    "Id": "S3-go***REMOVED***-dev-app-content",
                    "DomainName": "go***REMOVED***-dev-app-content.s3.amazonaws.com",
                    "OriginPath": "",
                    "CustomHeaders": {
                      "Quantity": 0,
                      "Items": []
                    },
                    "S3OriginConfig": {
                      "OriginAccessIdentity": ""
                    }
                  }
                ]
              },
              "DefaultCacheBehavior": {
                "TargetOriginId": "S3-go***REMOVED***-dev-app-content",
                "ForwardedValues": {
                  "QueryString": false,
                  "Cookies": {
                    "Forward": "none"
                  },
                  "Headers": {
                    "Quantity": 0,
                    "Items": []
                  },
                  "QueryStringCacheKeys": {
                    "Quantity": 0,
                    "Items": []
                  }
                },
                "TrustedSigners": {
                  "Enabled": false,
                  "Quantity": 0,
                  "Items": []
                },
                "ViewerProtocolPolicy": "allow-all",
                "MinTTL": 0,
                "AllowedMethods": {
                  "Quantity": 2,
                  "Items": [
                    "HEAD",
                    "GET"
                  ],
                  "CachedMethods": {
                    "Quantity": 2,
                    "Items": [
                      "HEAD",
                      "GET"
                    ]
                  }
                },
                "SmoothStreaming": false,
                "DefaultTTL": 86400,
                "MaxTTL": 31536000,
                "Compress": false,
                "LambdaFunctionAssociations": {
                  "Quantity": 0,
                  "Items": []
                }
              },
              "CacheBehaviors": {
                "Quantity": 0,
                "Items": []
              },
              "CustomErrorResponses": {
                "Quantity": 0,
                "Items": []
              },
              "Comment": "",
              "PriceClass": "PriceClass_All",
              "Enabled": true,
              "ViewerCertificate": {
                "CloudFrontDefaultCertificate": true,
                "MinimumProtocolVersion": "SSLv3",
                "CertificateSource": "cloudfront"
              },
              "Restrictions": {
                "GeoRestriction": {
                  "RestrictionType": "none",
                  "Quantity": 0,
                  "Items": []
                }
              },
              "WebACLId": ""
            }
          ]
        }
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        listDistributions: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listDistributionsResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        CloudFront: () => {
          return awsCloudFrontServiceMock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let cname = 'newCDN.example.com';

      //Act
      let resultPromise = cloudFrontClientService._getDistributionByCName(cname);

      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.deep.equal({});
      });
    });
  })

});
