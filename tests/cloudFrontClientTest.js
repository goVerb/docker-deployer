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


describe('CloudFront Client', function() {
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

  describe('createOrUpdateCloudFrontDistribution', () => {
    it('should call _getDistributionByCName once', () => {
      //Arrange

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let createdDistribution = {
        Id: 'something',
        DistributionConfig: {
          Aliases: {}
        }
      };
      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves(createdDistribution);
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves();
      cloudFrontClientService._updateCloudFrontDistribution = sandbox.stub().resolves();

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService.createOrUpdateCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(cloudFrontClientService._getDistributionByCName.calledOnce).to.be.true;
      });
    });

    it('should NOT call _createCloudFrontDistribution when distribution exist', () => {
      //Arrange

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let createdDistribution = {
        Id: 'something',
        DistributionConfig: {
          Aliases: {}
        }
      };
      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves(createdDistribution);
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves();
      cloudFrontClientService._updateCloudFrontDistribution = sandbox.stub().resolves();
      cloudFrontClientService._isDistributionOutOfDate = sandbox.stub().returns(false);

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService.createOrUpdateCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(cloudFrontClientService._createCloudFrontDistribution.callCount).to.be.equal(0);
      });
    });

    it('should call _createCloudFrontDistribution once when distribution doesnt exist', () => {
      //Arrange

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves({});
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves({});


      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService.createOrUpdateCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(cloudFrontClientService._createCloudFrontDistribution.callCount).to.be.equal(1);
      });
    });

    it('should pass parameters to _createCloudFrontDistribution when distribution doesnt exist', () => {
      //Arrange

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves({});
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves({});

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/',
        originProtocolPolicy: 'http-only'
      };

      //Act
      let resultPromise = cloudFrontClientService.createOrUpdateCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(cloudFrontClientService._createCloudFrontDistribution.args[0][0]).to.be.deep.equal(cloudFrontDistributionParams);
      });
    });

    it('should call _updateCloudFrontDistribution if cloudfront exist and needs to be updated', () => {
      //Arrange

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let createdDistribution = {
        Id: 'something',
        DistributionConfig: {
          Aliases: {}
        }
      };
      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves(createdDistribution);
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves();
      cloudFrontClientService._updateCloudFrontDistribution = sandbox.stub().resolves();
      cloudFrontClientService._isDistributionOutOfDate = sandbox.stub().returns(true);

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService.createOrUpdateCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(cloudFrontClientService._updateCloudFrontDistribution.callCount).to.be.equal(1);
      });
    });

    it('should pass distribution as first parameter to _updateCloudFrontDistribution if cloudfront exist and needs to be updated', () => {
      //Arrange

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      let createdDistribution = {
        Id: 'something',
        DistributionConfig: {
          Aliases: {}
        }
      };
      cloudFrontClientService._getDistributionByCName = sandbox.stub().resolves(createdDistribution);
      cloudFrontClientService._createCloudFrontDistribution = sandbox.stub().resolves();
      cloudFrontClientService._updateCloudFrontDistribution = sandbox.stub().resolves();
      cloudFrontClientService._isDistributionOutOfDate = sandbox.stub().returns(true);

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService.createOrUpdateCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let passInDistribution = cloudFrontClientService._updateCloudFrontDistribution.args[0][0];

        expect(passInDistribution).to.be.deep.equal(createdDistribution);
      });
    });
  });

  describe('_createCloudFrontDistribution', () => {

    it('pass params.cname to createDistribution method', () => {
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
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
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
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
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
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
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
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
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
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
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

        expect(params.DistributionConfig.Origins.Items[0].OriginPath).to.be.equal(cloudFrontDistributionParams.originPath);

      });
    });

    it('pass params.pathPattern to createDistribution method', () => {
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
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '',
        pathPattern: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.createDistribution.args[0][0];

        expect(params.DistributionConfig.CacheBehaviors.Items[0].PathPattern).to.be.equal(cloudFrontDistributionParams.pathPattern);

      });
    });

    it('should pass params.originProtocolPolicy to createDistribution method', () => {
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
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/',
        originProtocolPolicy: 'https-only'
      };

      //Act
      let resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.createDistribution.args[0][0];

        expect(params.DistributionConfig.Origins.Items[0].CustomOriginConfig.OriginProtocolPolicy).to.be.equal(cloudFrontDistributionParams.originProtocolPolicy);
      });
    });

    it('should originProtocolPolicy to match-viewer when not passed in', () => {
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
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
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

        expect(params.DistributionConfig.Origins.Items[0].CustomOriginConfig.OriginProtocolPolicy).to.be.equal('match-viewer');
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
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      const cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '',
        acmCertArn: 'myCertArn'
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

    it('should have logging disabled if enableLogging is falsy', () => {
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
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      const cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '',
        acmCertArn: 'myCertArn'
      };

      //Act
      const resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        const params = awsCloudFrontServiceMock.createDistribution.args[0][0];
        expect(params.DistributionConfig.Logging).to.deep.equal({
          Bucket: '', /* required */
          Enabled: false, /* required */
          IncludeCookies: false, /* required */
          Prefix: '' /* required */
        });
      });
    });

    it('should have logging enabled with the cname as a prefix if enableLogging', () => {
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
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      const cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '',
        acmCertArn: 'myCertArn',
        enableLogging: true
      };

      //Act
      const resultPromise = cloudFrontClientService._createCloudFrontDistribution(cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        const params = awsCloudFrontServiceMock.createDistribution.args[0][0];
        expect(params.DistributionConfig.Logging).to.deep.equal({
          Bucket: 'cloudfront-***REMOVED***.s3.amazonaws.com', /* required */
          Enabled: true, /* required */
          IncludeCookies: false, /* required */
          Prefix: 'test.example.com' /* required */
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
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
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
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
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
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
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

    it('should call waitFor twice if first timesout', () => {
      //Arrange
      let createDistributionResponse = {
        Distribution: {
          Id: 'abc123'
        }
      };

      let waitForStub = sandbox.stub();
      waitForStub.onCall(0).returns({
        promise: () => {
          return BluebirdPromise.reject({})
        }
      });
      waitForStub.onCall(1).returns({
        promise: () => {
          return BluebirdPromise.resolve({})
        }
      });

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        createDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createDistributionResponse)
          }
        }),
        waitFor: waitForStub
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
        expect(awsCloudFrontServiceMock.waitFor.callCount).to.be.equal(2);
      });
    });
  });

  describe('_updateCloudFrontDistribution', () => {
    it('pass params.cname to updateDistribution method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };



      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];
        expect(params.DistributionConfig.Aliases.Items[0]).to.be.equal(cloudFrontDistributionParams.cname);
      });
    });

    it('pass params.comment to updateDistribution method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];
        expect(params.DistributionConfig.Comment).to.be.equal(cloudFrontDistributionParams.comment);
      });
    });

    it('pass params.originName to updateDistribution method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];

        expect(params.DistributionConfig.DefaultCacheBehavior.TargetOriginId).to.be.equal(cloudFrontDistributionParams.originName);

        expect(params.DistributionConfig.Origins.Items[0].Id).to.be.equal(cloudFrontDistributionParams.originName);

        expect(params.DistributionConfig.CacheBehaviors.Items[0].TargetOriginId).to.be.equal(cloudFrontDistributionParams.originName);
      });
    });

    it('pass params.originDomainName to updateDistribution method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];

        expect(params.DistributionConfig.Origins.Items[0].DomainName).to.be.equal(cloudFrontDistributionParams.originDomainName);
      });
    });

    it('pass params.originPath to updateDistribution method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];

        expect(params.DistributionConfig.Origins.Items[0].OriginPath).to.be.equal(cloudFrontDistributionParams.originPath);

      });
    });

    it('pass params.pathPattern to updateDistribution method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '',
        pathPattern: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];

        expect(params.DistributionConfig.CacheBehaviors.Items[0].PathPattern).to.be.equal(cloudFrontDistributionParams.pathPattern);

      });
    });

    it('pass distributionId to updateDistribution method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '',
        pathPattern: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];

        expect(params.Id).to.be.equal(distribution.Id);
      });
    });

    it('pass IfMatch to updateDistribution method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        ETag: 'uniqueETag',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '',
        pathPattern: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];

        expect(params.IfMatch).to.be.equal(distribution.ETag);
      });
    });

    it('should pass params.originProtocolPolicy to updateDistribution method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/',
        originProtocolPolicy: 'https-only'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];

        expect(params.DistributionConfig.Origins.Items[0].CustomOriginConfig.OriginProtocolPolicy).to.be.equal(cloudFrontDistributionParams.originProtocolPolicy);
      });
    });

    it('should originProtocolPolicy to match-viewer when not passed in', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        let params = awsCloudFrontServiceMock.updateDistribution.args[0][0];

        expect(params.DistributionConfig.Origins.Items[0].CustomOriginConfig.OriginProtocolPolicy).to.be.equal('match-viewer');
      });
    });

    it('should add a ViewerCertificate if acmCertArn is provided', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      const cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '',
        acmCertArn: 'myCertArn'
      };

      //Act
      const resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        const params = awsCloudFrontServiceMock.updateDistribution.args[0][0];
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
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(awsCloudFrontServiceMock.waitFor.args[0][1].Id).to.be.equal(updateDistributionResponse.Distribution.Id);
      });
    });

    it('should pass resourceWaiter to waitFor method', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(awsCloudFrontServiceMock.waitFor.args[0][0]).to.be.equal('distributionDeployed');
      });
    });

    it('should call waitFor once', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({})
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

      let cloudFrontDistributionParams = {
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(awsCloudFrontServiceMock.waitFor.calledOnce).to.be.true;
      });
    });

    it('should call waitFor twice if first timesout', () => {
      //Arrange
      let distribution = {
        Id: '123',
        DistributionConfig: {
          CallerReference: 'abc'
        }
      };

      let updateDistributionResponse = {
        Distribution: distribution
      };

      let waitForStub = sandbox.stub();
      waitForStub.onCall(0).returns({
        promise: () => {
          return BluebirdPromise.reject({})
        }
      });
      waitForStub.onCall(1).returns({
        promise: () => {
          return BluebirdPromise.resolve({})
        }
      });

      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        updateDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(updateDistributionResponse)
          }
        }),
        waitFor: waitForStub
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
        cname: 'test.example.com',
        comment: 'something cool',
        originName: 'testOriginName',
        originDomainName: 'ajkfdljsfkdal',
        originPath: '/'
      };

      //Act
      let resultPromise = cloudFrontClientService._updateCloudFrontDistribution(distribution, cloudFrontDistributionParams);

      //Assert
      return resultPromise.then(() => {
        expect(awsCloudFrontServiceMock.waitFor.callCount).to.be.equal(2);
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
        'DistributionList': {
          'Marker': '',
          'MaxItems': 100,
          'IsTruncated': false,
          'Quantity': 3,
          'Items': [
            {
              'Id': '12312312',
              'ARN': 'arn:aws:cloudfront::1312:distribution/AREF',
              'Status': 'Deployed',
              'LastModifiedTime': '2014-01-09T13:13:41.629Z',
              'DomainName': 'abc.cloudfront.net',
              'Aliases': {
                'Quantity': 1,
                'Items': [
                  'stuff.example.com'
                ]
              },
              'Origins': {
                'Quantity': 1,
                'Items': [
                  {
                    'Id': 'S3-go***REMOVED***-www-wp-content',
                    'DomainName': 'go***REMOVED***-prod-www-wp-content.s3.amazonaws.com',
                    'OriginPath': '',
                    'CustomHeaders': {
                      'Quantity': 0,
                      'Items': []
                    },
                    'S3OriginConfig': {
                      'OriginAccessIdentity': ''
                    }
                  }
                ]
              },
              'DefaultCacheBehavior': {
                'TargetOriginId': 'S3-go***REMOVED***-www-wp-content',
                'ForwardedValues': {
                  'QueryString': false,
                  'Cookies': {
                    'Forward': 'none'
                  },
                  'Headers': {
                    'Quantity': 0,
                    'Items': []
                  },
                  'QueryStringCacheKeys': {
                    'Quantity': 0,
                    'Items': []
                  }
                },
                'TrustedSigners': {
                  'Enabled': false,
                  'Quantity': 0,
                  'Items': []
                },
                'ViewerProtocolPolicy': 'allow-all',
                'MinTTL': 0,
                'AllowedMethods': {
                  'Quantity': 2,
                  'Items': [
                    'HEAD',
                    'GET'
                  ],
                  'CachedMethods': {
                    'Quantity': 2,
                    'Items': [
                      'HEAD',
                      'GET'
                    ]
                  }
                },
                'SmoothStreaming': false,
                'DefaultTTL': 86400,
                'MaxTTL': 31536000,
                'Compress': false,
                'LambdaFunctionAssociations': {
                  'Quantity': 0,
                  'Items': []
                }
              },
              'CacheBehaviors': {
                'Quantity': 0,
                'Items': []
              },
              'CustomErrorResponses': {
                'Quantity': 0,
                'Items': []
              },
              'Comment': '',
              'PriceClass': 'PriceClass_All',
              'Enabled': true,
              'ViewerCertificate': {
                'CloudFrontDefaultCertificate': true,
                'MinimumProtocolVersion': 'SSLv3',
                'CertificateSource': 'cloudfront'
              },
              'Restrictions': {
                'GeoRestriction': {
                  'RestrictionType': 'none',
                  'Quantity': 0,
                  'Items': []
                }
              },
              'WebACLId': ''
            },
            {
              'Id': 'E21EM2OH01LPLB',
              'ARN': 'arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB',
              'Status': 'Deployed',
              'LastModifiedTime': '2013-08-05T17:52:03.220Z',
              'DomainName': 'd23lkb2zft31e.cloudfront.net',
              'Aliases': {
                'Quantity': 1,
                'Items': [
                  'applesauce.example.com'
                ]
              },
              'Origins': {
                'Quantity': 1,
                'Items': [
                  {
                    'Id': 'S3-go***REMOVED***-dev-www-wp-content',
                    'DomainName': 'go***REMOVED***-dev-www-wp-content.s3.amazonaws.com',
                    'OriginPath': '',
                    'CustomHeaders': {
                      'Quantity': 0,
                      'Items': []
                    },
                    'S3OriginConfig': {
                      'OriginAccessIdentity': ''
                    }
                  }
                ]
              },
              'DefaultCacheBehavior': {
                'TargetOriginId': 'S3-go***REMOVED***-dev-www-wp-content',
                'ForwardedValues': {
                  'QueryString': false,
                  'Cookies': {
                    'Forward': 'none'
                  },
                  'Headers': {
                    'Quantity': 0,
                    'Items': []
                  },
                  'QueryStringCacheKeys': {
                    'Quantity': 0,
                    'Items': []
                  }
                },
                'TrustedSigners': {
                  'Enabled': false,
                  'Quantity': 0,
                  'Items': []
                },
                'ViewerProtocolPolicy': 'allow-all',
                'MinTTL': 0,
                'AllowedMethods': {
                  'Quantity': 2,
                  'Items': [
                    'HEAD',
                    'GET'
                  ],
                  'CachedMethods': {
                    'Quantity': 2,
                    'Items': [
                      'HEAD',
                      'GET'
                    ]
                  }
                },
                'SmoothStreaming': false,
                'DefaultTTL': 86400,
                'MaxTTL': 31536000,
                'Compress': false,
                'LambdaFunctionAssociations': {
                  'Quantity': 0,
                  'Items': []
                }
              },
              'CacheBehaviors': {
                'Quantity': 0,
                'Items': []
              },
              'CustomErrorResponses': {
                'Quantity': 0,
                'Items': []
              },
              'Comment': '',
              'PriceClass': 'PriceClass_All',
              'Enabled': true,
              'ViewerCertificate': {
                'CloudFrontDefaultCertificate': true,
                'MinimumProtocolVersion': 'SSLv3',
                'CertificateSource': 'cloudfront'
              },
              'Restrictions': {
                'GeoRestriction': {
                  'RestrictionType': 'none',
                  'Quantity': 0,
                  'Items': []
                }
              },
              'WebACLId': ''
            },
            {
              'Id': 'KILM',
              'ARN': 'arn:aws:cloudfront::1321321321:distribution/REFDE1',
              'Status': 'Deployed',
              'LastModifiedTime': '2016-04-06T20:41:21.730Z',
              'DomainName': 'd3tdpo6iwhiw09.cloudfront.net',
              'Aliases': {
                'Quantity': 1,
                'Items': [
                  'grapes.example.com'
                ]
              },
              'Origins': {
                'Quantity': 1,
                'Items': [
                  {
                    'Id': 'S3-go***REMOVED***-dev-app-content',
                    'DomainName': 'go***REMOVED***-dev-app-content.s3.amazonaws.com',
                    'OriginPath': '',
                    'CustomHeaders': {
                      'Quantity': 0,
                      'Items': []
                    },
                    'S3OriginConfig': {
                      'OriginAccessIdentity': ''
                    }
                  }
                ]
              },
              'DefaultCacheBehavior': {
                'TargetOriginId': 'S3-go***REMOVED***-dev-app-content',
                'ForwardedValues': {
                  'QueryString': false,
                  'Cookies': {
                    'Forward': 'none'
                  },
                  'Headers': {
                    'Quantity': 0,
                    'Items': []
                  },
                  'QueryStringCacheKeys': {
                    'Quantity': 0,
                    'Items': []
                  }
                },
                'TrustedSigners': {
                  'Enabled': false,
                  'Quantity': 0,
                  'Items': []
                },
                'ViewerProtocolPolicy': 'allow-all',
                'MinTTL': 0,
                'AllowedMethods': {
                  'Quantity': 2,
                  'Items': [
                    'HEAD',
                    'GET'
                  ],
                  'CachedMethods': {
                    'Quantity': 2,
                    'Items': [
                      'HEAD',
                      'GET'
                    ]
                  }
                },
                'SmoothStreaming': false,
                'DefaultTTL': 86400,
                'MaxTTL': 31536000,
                'Compress': false,
                'LambdaFunctionAssociations': {
                  'Quantity': 0,
                  'Items': []
                }
              },
              'CacheBehaviors': {
                'Quantity': 0,
                'Items': []
              },
              'CustomErrorResponses': {
                'Quantity': 0,
                'Items': []
              },
              'Comment': '',
              'PriceClass': 'PriceClass_All',
              'Enabled': true,
              'ViewerCertificate': {
                'CloudFrontDefaultCertificate': true,
                'MinimumProtocolVersion': 'SSLv3',
                'CertificateSource': 'cloudfront'
              },
              'Restrictions': {
                'GeoRestriction': {
                  'RestrictionType': 'none',
                  'Quantity': 0,
                  'Items': []
                }
              },
              'WebACLId': ''
            }
          ]
        }
      };

      let getDistributionResult = {Distribution:{"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":['example.com']},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":"***REMOVED*** API Gateway - Dev","DomainName":"xvb2ov8vai.execute-api.us-west-2.amazonaws.com","OriginPath":"/Dev","CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":"match-viewer","OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":"The Dev Environment for the ***REMOVED*** API","Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":"arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3","SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":'applesauceArn',"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true}}, "ETag":"EM6TN7UQZMM3Z"};


      //setting up autoScalingClient Mock
      let awsCloudFrontServiceMock = {
        listDistributions: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listDistributionsResponse)
          }
        }),
        getDistribution: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(getDistributionResult)
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
        expect(result.Id).to.be.equal('E21EM2OH01LPLB');
      });
    });

    it('should return empty object if no distribution contains the cname Alias', () => {
      //Arrange
      let listDistributionsResponse = {
        'DistributionList': {
          'Marker': '',
          'MaxItems': 100,
          'IsTruncated': false,
          'Quantity': 3,
          'Items': [
            {
              'Id': '12312312',
              'ARN': 'arn:aws:cloudfront::1312:distribution/AREF',
              'Status': 'Deployed',
              'LastModifiedTime': '2014-01-09T13:13:41.629Z',
              'DomainName': 'abc.cloudfront.net',
              'Aliases': {
                'Quantity': 1,
                'Items': [
                  'stuff.example.com'
                ]
              },
              'Origins': {
                'Quantity': 1,
                'Items': [
                  {
                    'Id': 'S3-go***REMOVED***-www-wp-content',
                    'DomainName': 'go***REMOVED***-prod-www-wp-content.s3.amazonaws.com',
                    'OriginPath': '',
                    'CustomHeaders': {
                      'Quantity': 0,
                      'Items': []
                    },
                    'S3OriginConfig': {
                      'OriginAccessIdentity': ''
                    }
                  }
                ]
              },
              'DefaultCacheBehavior': {
                'TargetOriginId': 'S3-go***REMOVED***-www-wp-content',
                'ForwardedValues': {
                  'QueryString': false,
                  'Cookies': {
                    'Forward': 'none'
                  },
                  'Headers': {
                    'Quantity': 0,
                    'Items': []
                  },
                  'QueryStringCacheKeys': {
                    'Quantity': 0,
                    'Items': []
                  }
                },
                'TrustedSigners': {
                  'Enabled': false,
                  'Quantity': 0,
                  'Items': []
                },
                'ViewerProtocolPolicy': 'allow-all',
                'MinTTL': 0,
                'AllowedMethods': {
                  'Quantity': 2,
                  'Items': [
                    'HEAD',
                    'GET'
                  ],
                  'CachedMethods': {
                    'Quantity': 2,
                    'Items': [
                      'HEAD',
                      'GET'
                    ]
                  }
                },
                'SmoothStreaming': false,
                'DefaultTTL': 86400,
                'MaxTTL': 31536000,
                'Compress': false,
                'LambdaFunctionAssociations': {
                  'Quantity': 0,
                  'Items': []
                }
              },
              'CacheBehaviors': {
                'Quantity': 0,
                'Items': []
              },
              'CustomErrorResponses': {
                'Quantity': 0,
                'Items': []
              },
              'Comment': '',
              'PriceClass': 'PriceClass_All',
              'Enabled': true,
              'ViewerCertificate': {
                'CloudFrontDefaultCertificate': true,
                'MinimumProtocolVersion': 'SSLv3',
                'CertificateSource': 'cloudfront'
              },
              'Restrictions': {
                'GeoRestriction': {
                  'RestrictionType': 'none',
                  'Quantity': 0,
                  'Items': []
                }
              },
              'WebACLId': ''
            },
            {
              'Id': 'fdsa',
              'ARN': 'arn:aws:cloudfront::***REMOVED***:distribution/REREF',
              'Status': 'Deployed',
              'LastModifiedTime': '2013-08-05T17:52:03.220Z',
              'DomainName': 'd23lkb2zft31e.cloudfront.net',
              'Aliases': {
                'Quantity': 1,
                'Items': [
                  'applesauce.example.com'
                ]
              },
              'Origins': {
                'Quantity': 1,
                'Items': [
                  {
                    'Id': 'S3-go***REMOVED***-dev-www-wp-content',
                    'DomainName': 'go***REMOVED***-dev-www-wp-content.s3.amazonaws.com',
                    'OriginPath': '',
                    'CustomHeaders': {
                      'Quantity': 0,
                      'Items': []
                    },
                    'S3OriginConfig': {
                      'OriginAccessIdentity': ''
                    }
                  }
                ]
              },
              'DefaultCacheBehavior': {
                'TargetOriginId': 'S3-go***REMOVED***-dev-www-wp-content',
                'ForwardedValues': {
                  'QueryString': false,
                  'Cookies': {
                    'Forward': 'none'
                  },
                  'Headers': {
                    'Quantity': 0,
                    'Items': []
                  },
                  'QueryStringCacheKeys': {
                    'Quantity': 0,
                    'Items': []
                  }
                },
                'TrustedSigners': {
                  'Enabled': false,
                  'Quantity': 0,
                  'Items': []
                },
                'ViewerProtocolPolicy': 'allow-all',
                'MinTTL': 0,
                'AllowedMethods': {
                  'Quantity': 2,
                  'Items': [
                    'HEAD',
                    'GET'
                  ],
                  'CachedMethods': {
                    'Quantity': 2,
                    'Items': [
                      'HEAD',
                      'GET'
                    ]
                  }
                },
                'SmoothStreaming': false,
                'DefaultTTL': 86400,
                'MaxTTL': 31536000,
                'Compress': false,
                'LambdaFunctionAssociations': {
                  'Quantity': 0,
                  'Items': []
                }
              },
              'CacheBehaviors': {
                'Quantity': 0,
                'Items': []
              },
              'CustomErrorResponses': {
                'Quantity': 0,
                'Items': []
              },
              'Comment': '',
              'PriceClass': 'PriceClass_All',
              'Enabled': true,
              'ViewerCertificate': {
                'CloudFrontDefaultCertificate': true,
                'MinimumProtocolVersion': 'SSLv3',
                'CertificateSource': 'cloudfront'
              },
              'Restrictions': {
                'GeoRestriction': {
                  'RestrictionType': 'none',
                  'Quantity': 0,
                  'Items': []
                }
              },
              'WebACLId': ''
            },
            {
              'Id': 'KILM',
              'ARN': 'arn:aws:cloudfront::1321321321:distribution/REFDE1',
              'Status': 'Deployed',
              'LastModifiedTime': '2016-04-06T20:41:21.730Z',
              'DomainName': 'd3tdpo6iwhiw09.cloudfront.net',
              'Aliases': {
                'Quantity': 1,
                'Items': [
                  'grapes.example.com'
                ]
              },
              'Origins': {
                'Quantity': 1,
                'Items': [
                  {
                    'Id': 'S3-go***REMOVED***-dev-app-content',
                    'DomainName': 'go***REMOVED***-dev-app-content.s3.amazonaws.com',
                    'OriginPath': '',
                    'CustomHeaders': {
                      'Quantity': 0,
                      'Items': []
                    },
                    'S3OriginConfig': {
                      'OriginAccessIdentity': ''
                    }
                  }
                ]
              },
              'DefaultCacheBehavior': {
                'TargetOriginId': 'S3-go***REMOVED***-dev-app-content',
                'ForwardedValues': {
                  'QueryString': false,
                  'Cookies': {
                    'Forward': 'none'
                  },
                  'Headers': {
                    'Quantity': 0,
                    'Items': []
                  },
                  'QueryStringCacheKeys': {
                    'Quantity': 0,
                    'Items': []
                  }
                },
                'TrustedSigners': {
                  'Enabled': false,
                  'Quantity': 0,
                  'Items': []
                },
                'ViewerProtocolPolicy': 'allow-all',
                'MinTTL': 0,
                'AllowedMethods': {
                  'Quantity': 2,
                  'Items': [
                    'HEAD',
                    'GET'
                  ],
                  'CachedMethods': {
                    'Quantity': 2,
                    'Items': [
                      'HEAD',
                      'GET'
                    ]
                  }
                },
                'SmoothStreaming': false,
                'DefaultTTL': 86400,
                'MaxTTL': 31536000,
                'Compress': false,
                'LambdaFunctionAssociations': {
                  'Quantity': 0,
                  'Items': []
                }
              },
              'CacheBehaviors': {
                'Quantity': 0,
                'Items': []
              },
              'CustomErrorResponses': {
                'Quantity': 0,
                'Items': []
              },
              'Comment': '',
              'PriceClass': 'PriceClass_All',
              'Enabled': true,
              'ViewerCertificate': {
                'CloudFrontDefaultCertificate': true,
                'MinimumProtocolVersion': 'SSLv3',
                'CertificateSource': 'cloudfront'
              },
              'Restrictions': {
                'GeoRestriction': {
                  'RestrictionType': 'none',
                  'Quantity': 0,
                  'Items': []
                }
              },
              'WebACLId': ''
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
  });

  describe('_isDistributionOutOfDate', () => {
    it('should detect difference in cnames', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;
      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":"arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3","SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate": certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: 'example.com',
        comment: comment,
        originName: originName,
        originDomainName: originDomainName,
        originPath: originPath,
        acmCertArn: certificateArn,
        originProtocolPolicy: originProtocolPolicy,
        queryString: queryString
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should detect difference in certificateArn', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;
      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":"arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3","SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        originName: originName,
        originDomainName: originDomainName,
        originPath: originPath,
        acmCertArn: 'applesauce',
        originProtocolPolicy: originProtocolPolicy,
        queryString: queryString
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should detect differences in comment', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;
      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: 'something cool',
        originName: originName,
        originDomainName: originDomainName,
        originPath: originPath,
        acmCertArn: certificateArn,
        originProtocolPolicy: originProtocolPolicy,
        queryString: queryString
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should detect differences in originDomainName', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;
      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        originName: originName,
        originDomainName: 'ajkfdljsfkdal',
        originPath: originPath,
        acmCertArn: certificateArn,
        originProtocolPolicy: originProtocolPolicy,
        queryString: queryString
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should detect differences in originPath', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;
      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        originName: originName,
        originDomainName: originDomainName,
        originPath: '/',
        acmCertArn: certificateArn,
        originProtocolPolicy: originProtocolPolicy,
        queryString: queryString
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should detect differences in originProtocolPolicy', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;
      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        originName: originName,
        originDomainName: originDomainName,
        originPath: originPath,
        acmCertArn: certificateArn,
        originProtocolPolicy: 'https-only',
        queryString: queryString
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should detect differences in queryString', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;
      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        originName: originName,
        originDomainName: originDomainName,
        originPath: originPath,
        acmCertArn: certificateArn,
        originProtocolPolicy: 'https-only',
        queryString: false
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should detect differences in customErrorResponses in numbers', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;
      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        originName: originName,
        originDomainName: originDomainName,
        originPath: originPath,
        acmCertArn: certificateArn,
        originProtocolPolicy: originProtocolPolicy,
        queryString: queryString,
        customErrorResponses: [
          {
            errorCode: 403, /* required */
            errorCachingMinTTL: 300,
            responseCode: '200',
            responsePagePath: '/'
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should detect differences in existing customErrorResponses', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;

      const customErrorResponse403 = {
        ErrorCode: 403,
        ErrorCachingMinTTL: 300,
        ResponseCode: '200',
        ResponsePagePath: '/'
      };

      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":1,"Items":[customErrorResponse403]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        originName: originName,
        originDomainName: originDomainName,
        originPath: originPath,
        acmCertArn: certificateArn,
        originProtocolPolicy: originProtocolPolicy,
        queryString: queryString,
        customErrorResponses: [
          {
            errorCode: customErrorResponse403.ErrorCode,
            errorCachingMinTTL: customErrorResponse403.ErrorCachingMinTTL,
            responseCode: customErrorResponse403.ResponseCode,
            responsePagePath: '/applesauce'
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should detect differences in cacheBehaviors in numbers', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let pathPattern = '/';
      let originProtocolPolicy = 'http-only';
      let queryString = true;


      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":`${pathPattern}`,"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        acmCertArn: certificateArn,
        customErrorResponses: [],
        cloudfrontPaths: [
          {
            originName: originName,
            originDomainName: 'safdsafasd',
            originPath: originPath,
            originProtocolPolicy: originProtocolPolicy,
            pathPattern: pathPattern,
            queryString: queryString,
          },
          {
            originName: 'static dev',
            originDomainName: 'safdsafasd',
            originPath: '/static',
            originProtocolPolicy: originProtocolPolicy,
            pathPattern: pathPattern,
            queryString: queryString,
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if cloudfrontPath.originDomainName is different', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let pathPattern = '/';
      let originProtocolPolicy = 'http-only';
      let queryString = true;

      const customErrorResponse403 = {
        ErrorCode: 403,
        ErrorCachingMinTTL: 300,
        ResponseCode: '200',
        ResponsePagePath: '/'
      };

      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":`${pathPattern}`,"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":1,"Items":[customErrorResponse403]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        acmCertArn: certificateArn,
        customErrorResponses: [
          {
            errorCode: customErrorResponse403.ErrorCode,
            errorCachingMinTTL: customErrorResponse403.ErrorCachingMinTTL,
            responseCode: customErrorResponse403.ResponseCode,
            responsePagePath: customErrorResponse403.ResponsePagePath
          }
        ],
        cloudfrontPaths: [
          {
            originName: originName,
            originDomainName: 'safdsafasd',
            originPath: originPath,
            originProtocolPolicy: originProtocolPolicy,
            pathPattern: pathPattern,
            queryString: queryString,
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if cloudfrontPath.originPath is different', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let pathPattern = '/';
      let originProtocolPolicy = 'http-only';
      let queryString = true;

      const customErrorResponse403 = {
        ErrorCode: 403,
        ErrorCachingMinTTL: 300,
        ResponseCode: '200',
        ResponsePagePath: '/'
      };

      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":`${pathPattern}`,"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":1,"Items":[customErrorResponse403]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        acmCertArn: certificateArn,
        customErrorResponses: [
          {
            errorCode: customErrorResponse403.ErrorCode,
            errorCachingMinTTL: customErrorResponse403.ErrorCachingMinTTL,
            responseCode: customErrorResponse403.ResponseCode,
            responsePagePath: customErrorResponse403.ResponsePagePath
          }
        ],
        cloudfrontPaths: [
          {
            originName: originName,
            originDomainName: originDomainName,
            originPath: 'dsafdafdasf',
            originProtocolPolicy: originProtocolPolicy,
            pathPattern: pathPattern,
            queryString: queryString,
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if cloudfrontPath.originProtocolPolicy is different', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let pathPattern = '/';
      let originProtocolPolicy = 'http-only';
      let queryString = true;

      const customErrorResponse403 = {
        ErrorCode: 403,
        ErrorCachingMinTTL: 300,
        ResponseCode: '200',
        ResponsePagePath: '/'
      };

      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":`${pathPattern}`,"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":1,"Items":[customErrorResponse403]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        acmCertArn: certificateArn,
        customErrorResponses: [
          {
            errorCode: customErrorResponse403.ErrorCode,
            errorCachingMinTTL: customErrorResponse403.ErrorCachingMinTTL,
            responseCode: customErrorResponse403.ResponseCode,
            responsePagePath: customErrorResponse403.ResponsePagePath
          }
        ],
        cloudfrontPaths: [
          {
            originName: originName,
            originDomainName: originDomainName,
            originPath: originPath,
            originProtocolPolicy: 'kjlkjkljifdsafads',
            pathPattern: pathPattern,
            queryString: queryString,
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

    it('should return false if cloudfrontPath is equal to classic params', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let pathPattern = '/';
      let originProtocolPolicy = 'http-only';
      let viewerProtocolPolicy = 'allow-all';
      let queryString = true;

      const customErrorResponse403 = {
        ErrorCode: 403,
        ErrorCachingMinTTL: 300,
        ResponseCode: '200',
        ResponsePagePath: '/'
      };

      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":`${originName}`,"ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":`${viewerProtocolPolicy}`,"MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":`${pathPattern}`,"TargetOriginId":`${originName}`,"ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":`${viewerProtocolPolicy}`,"MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":1,"Items":[customErrorResponse403]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        acmCertArn: certificateArn,
        customErrorResponses: [
          {
            errorCode: customErrorResponse403.ErrorCode,
            errorCachingMinTTL: customErrorResponse403.ErrorCachingMinTTL,
            responseCode: customErrorResponse403.ResponseCode,
            responsePagePath: customErrorResponse403.ResponsePagePath
          }
        ],
        cloudfrontPaths: [
          {
            originName: originName,
            originDomainName: originDomainName,
            originPath: originPath,
            originProtocolPolicy: originProtocolPolicy,
            viewerProtocolPolicy: viewerProtocolPolicy,
            pathPattern: pathPattern,
            queryString: queryString,
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.false;
    });

    it('should return false if no changes', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let viewerProtocolPolicy = 'redirect-to-https';
      let originProtocolPolicy = 'http-only';
      let queryString = true;

      const customErrorResponse403 = {
        ErrorCode: 403,
        ErrorCachingMinTTL: 300,
        ResponseCode: '200',
        ResponsePagePath: '/'
      };

      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"ViewerProtocolPolicy":viewerProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":`${originName}`,"ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":viewerProtocolPolicy,"MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":`${originName}`,"ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":1,"Items":[customErrorResponse403]},"Comment":comment,"Logging":{"Enabled":false,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        originName: originName,
        originDomainName: originDomainName,
        originPath: originPath,
        pathPattern: '/',
        acmCertArn: certificateArn,
        originProtocolPolicy: originProtocolPolicy,
        viewerProtocolPolicy: viewerProtocolPolicy,
        queryString: queryString,
        customErrorResponses: [
          {
            errorCode: customErrorResponse403.ErrorCode,
            errorCachingMinTTL: customErrorResponse403.ErrorCachingMinTTL,
            responseCode: customErrorResponse403.ResponseCode,
            responsePagePath: customErrorResponse403.ResponsePagePath
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.false;
    });

    it('should detect differences in logging enabled', () => {
      //Arrange
      let originName = 'something api';
      let cname = 'test.example.com';
      let certificateArn = 'uniqueArn';
      let comment = 'existing comment';
      let originDomainName = 'asfsafdafdas.something';
      let originPath = '/expected';
      let originProtocolPolicy = 'http-only';
      let queryString = true;
      let enableLogging = false;
      let distribution = {"Id":"E21EM2OH01LPLB","ARN":"arn:aws:cloudfront::***REMOVED***:distribution/E21EM2OH01LPLB","Status":"Deployed","LastModifiedTime":"2016-12-20T23:42:55.574Z","InProgressInvalidationBatches":0,"DomainName":"d2296tvo3hsqb0.cloudfront.net","ActiveTrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"DistributionConfig":{"CallerReference":"4d3b4bbf-9c6a-4fbb-a6a6-79990d77311d","Aliases":{"Quantity":1,"Items":[cname]},"DefaultRootObject":"","Origins":{"Quantity":1,"Items":[{"Id":originName,"DomainName":originDomainName,"OriginPath":originPath,"CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":originProtocolPolicy,"OriginSslProtocols":{"Quantity":3,"Items":["TLSv1","TLSv1.1","TLSv1.2"]}}}]},"DefaultCacheBehavior":{"TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":queryString,"Cookies":{"Forward":"none"},"Headers":{"Quantity":4,"Items":["Content-Type","authorization","x-***REMOVED***-test","x-***REMOVED***-version"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":false,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}},"CacheBehaviors":{"Quantity":1,"Items":[{"PathPattern":"/","TargetOriginId":"***REMOVED*** API Gateway - Dev","ForwardedValues":{"QueryString":false,"Cookies":{"Forward":"none"},"Headers":{"Quantity":0,"Items":[]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","MinTTL":0,"AllowedMethods":{"Quantity":7,"Items":["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],"CachedMethods":{"Quantity":3,"Items":["HEAD","GET","OPTIONS"]}},"SmoothStreaming":false,"DefaultTTL":0,"MaxTTL":0,"Compress":true,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]}}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"Comment":comment,"Logging":{"Enabled":enableLogging,"IncludeCookies":false,"Bucket":"","Prefix":""},"PriceClass":"PriceClass_All","Enabled":true,"ViewerCertificate":{"ACMCertificateArn":certificateArn,"SSLSupportMethod":"sni-only","MinimumProtocolVersion":"TLSv1","Certificate":certificateArn,"CertificateSource":"acm"},"Restrictions":{"GeoRestriction":{"RestrictionType":"none","Quantity":0,"Items":[]}},"WebACLId":"","HttpVersion":"http2","IsIPV6Enabled":true},"ETag":"EM6TN7UQZMM3Z"};

      let cloudFrontParams = {
        cname: cname,
        comment: comment,
        originName: originName,
        originDomainName: originDomainName,
        originPath: originPath,
        acmCertArn: certificateArn,
        originProtocolPolicy: originProtocolPolicy,
        queryString: queryString,
        enableLogging: true
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      let result = cloudFrontClientService._isDistributionOutOfDate(distribution, cloudFrontParams);

      //Assert
      expect(result).to.be.true;
    });

  });

  describe('_buildDistributionConfig', () => {
    it('should build config with classic parameters', () => {
      //Arrange
      const practiceConfig = {
        cname: 'dev.***REMOVED***.net',
        acmCertArn: 'arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3',
        comment: 'The Dev Environment for the ***REMOVED*** Front End',
        originName: '***REMOVED*** Web - Dev',
        originDomainName: '***REMOVED***-web.s3-website-us-west-2.amazonaws.com',
        originPath: '',
        pathPattern: '/',
        originProtocolPolicy: 'http-only',
        queryString: true,
        enableLogging: true,
        customErrorResponses: [],
        cloudfrontPaths: []
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      const result = cloudFrontClientService._buildDistributionConfig(practiceConfig, 'abc123');

      //Assert
      expect(result).to.be.deep.equal({"DistributionConfig":{"CallerReference":"abc123","Comment":"The Dev Environment for the ***REMOVED*** Front End","DefaultCacheBehavior":{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false},"Enabled":true,"Origins":{"Quantity":1,"Items":[{"DomainName":"***REMOVED***-web.s3-website-us-west-2.amazonaws.com","Id":"***REMOVED*** Web - Dev","CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":"http-only","OriginSslProtocols":{"Items":["TLSv1","TLSv1.1","TLSv1.2"],"Quantity":3}},"OriginPath":""}]},"Aliases":{"Quantity":1,"Items":["dev.***REMOVED***.net"]},"CacheBehaviors":{"Quantity":1,"Items":[{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"PathPattern":"/","TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"DefaultRootObject":"","HttpVersion":"http2","IsIPV6Enabled":true,"Logging":{"Bucket":"cloudfront-***REMOVED***.s3.amazonaws.com","Enabled":true,"IncludeCookies":false,"Prefix":"dev.***REMOVED***.net"},"PriceClass":"PriceClass_All","Restrictions":{"GeoRestriction":{"Quantity":0,"RestrictionType":"none","Items":[]}},"WebACLId":"","ViewerCertificate":{"ACMCertificateArn":"arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3","CertificateSource":"acm","MinimumProtocolVersion":"TLSv1","SSLSupportMethod":"sni-only"}}});
    });

    it('should build config with cloudfrontPaths parameter', () => {
      //Arrange
      const practiceConfig = {
        cname: 'dev.***REMOVED***.net',
        acmCertArn: 'arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3',
        comment: 'The Dev Environment for the ***REMOVED*** Front End',
        enableLogging: true,
        customErrorResponses: [],
        cloudfrontPaths: [
          {
            originName: '***REMOVED*** Web - Dev',
            originDomainName: '***REMOVED***-web.s3-website-us-west-2.amazonaws.com',
            originPath: '',
            pathPattern: '/',
            originProtocolPolicy: 'http-only',
            queryString: true
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      const result = cloudFrontClientService._buildDistributionConfig(practiceConfig, 'abc123');

      //Assert
      expect(result).to.be.deep.equal({"DistributionConfig":{"CallerReference":"abc123","Comment":"The Dev Environment for the ***REMOVED*** Front End","DefaultCacheBehavior":{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false},"Enabled":true,"Origins":{"Quantity":1,"Items":[{"DomainName":"***REMOVED***-web.s3-website-us-west-2.amazonaws.com","Id":"***REMOVED*** Web - Dev","CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":"http-only","OriginSslProtocols":{"Items":["TLSv1","TLSv1.1","TLSv1.2"],"Quantity":3}},"OriginPath":""}]},"Aliases":{"Quantity":1,"Items":["dev.***REMOVED***.net"]},"CacheBehaviors":{"Quantity":1,"Items":[{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"PathPattern":"/","TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"DefaultRootObject":"","HttpVersion":"http2","IsIPV6Enabled":true,"Logging":{"Bucket":"cloudfront-***REMOVED***.s3.amazonaws.com","Enabled":true,"IncludeCookies":false,"Prefix":"dev.***REMOVED***.net"},"PriceClass":"PriceClass_All","Restrictions":{"GeoRestriction":{"Quantity":0,"RestrictionType":"none","Items":[]}},"WebACLId":"","ViewerCertificate":{"ACMCertificateArn":"arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3","CertificateSource":"acm","MinimumProtocolVersion":"TLSv1","SSLSupportMethod":"sni-only"}}});
    });

    it('should build config with cloudfrontPaths parameter', () => {
      //Arrange
      const practiceConfig = {
        cname: 'dev.***REMOVED***.net',
        acmCertArn: 'arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3',
        comment: 'The Dev Environment for the ***REMOVED*** Front End',
        enableLogging: true,
        customErrorResponses: [],
        cloudfrontPaths: [
          {
            originName: '***REMOVED*** Web - Dev',
            originDomainName: '***REMOVED***-web.s3-website-us-west-2.amazonaws.com',
            originPath: '',
            pathPattern: '/',
            originProtocolPolicy: 'http-only',
            queryString: true
          },
          {
            originName: '***REMOVED*** Web - Static Dev',
            originDomainName: '***REMOVED***-web.s3-website-us-west-2.amazonaws.com',
            originPath: '/static',
            pathPattern: '/static',
            originProtocolPolicy: 'http-only',
            queryString: true
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      const result = cloudFrontClientService._buildDistributionConfig(practiceConfig, 'abc123');

      //Assert
      expect(result).to.be.deep.equal({"DistributionConfig":{"CallerReference":"abc123","Comment":"The Dev Environment for the ***REMOVED*** Front End","DefaultCacheBehavior":{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false},"Enabled":true,"Origins":{"Quantity":2,"Items":[{"DomainName":"***REMOVED***-web.s3-website-us-west-2.amazonaws.com","Id":"***REMOVED*** Web - Dev","CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":"http-only","OriginSslProtocols":{"Items":["TLSv1","TLSv1.1","TLSv1.2"],"Quantity":3}},"OriginPath":""},{"DomainName":"***REMOVED***-web.s3-website-us-west-2.amazonaws.com","Id":"***REMOVED*** Web - Static Dev","CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":"http-only","OriginSslProtocols":{"Items":["TLSv1","TLSv1.1","TLSv1.2"],"Quantity":3}},"OriginPath":"/static"}]},"Aliases":{"Quantity":1,"Items":["dev.***REMOVED***.net"]},"CacheBehaviors":{"Quantity":2,"Items":[{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"PathPattern":"/","TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false},{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"PathPattern":"/static","TargetOriginId":"***REMOVED*** Web - Static Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false}]},"CustomErrorResponses":{"Quantity":0,"Items":[]},"DefaultRootObject":"","HttpVersion":"http2","IsIPV6Enabled":true,"Logging":{"Bucket":"cloudfront-***REMOVED***.s3.amazonaws.com","Enabled":true,"IncludeCookies":false,"Prefix":"dev.***REMOVED***.net"},"PriceClass":"PriceClass_All","Restrictions":{"GeoRestriction":{"Quantity":0,"RestrictionType":"none","Items":[]}},"WebACLId":"","ViewerCertificate":{"ACMCertificateArn":"arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3","CertificateSource":"acm","MinimumProtocolVersion":"TLSv1","SSLSupportMethod":"sni-only"}}});
    });

    it('should pass customErrorResponses for classic parameters', () => {
      //Arrange
      const practiceConfig = {
        cname: 'dev.***REMOVED***.net',
        acmCertArn: 'arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3',
        comment: 'The Dev Environment for the ***REMOVED*** Front End',
        originName: '***REMOVED*** Web - Dev',
        originDomainName: '***REMOVED***-web.s3-website-us-west-2.amazonaws.com',
        originPath: '',
        pathPattern: '/',
        originProtocolPolicy: 'http-only',
        queryString: true,
        enableLogging: true,
        customErrorResponses: [
          {
            errorCode: 403, /* required */
            errorCachingMinTTL: 300,
            responseCode: '200',
            responsePagePath: '/'
          }
        ],
        cloudfrontPaths: []
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      const result = cloudFrontClientService._buildDistributionConfig(practiceConfig, 'abc123');

      //Assert
      expect(result).to.be.deep.equal({"DistributionConfig":{"CallerReference":"abc123","Comment":"The Dev Environment for the ***REMOVED*** Front End","DefaultCacheBehavior":{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false},"Enabled":true,"Origins":{"Quantity":1,"Items":[{"DomainName":"***REMOVED***-web.s3-website-us-west-2.amazonaws.com","Id":"***REMOVED*** Web - Dev","CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":"http-only","OriginSslProtocols":{"Items":["TLSv1","TLSv1.1","TLSv1.2"],"Quantity":3}},"OriginPath":""}]},"Aliases":{"Quantity":1,"Items":["dev.***REMOVED***.net"]},"CacheBehaviors":{"Quantity":1,"Items":[{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"PathPattern":"/","TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"allow-all","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false}]},"CustomErrorResponses":{"Quantity":1,"Items":[{"ErrorCode":403,"ErrorCachingMinTTL":300,"ResponseCode":"200","ResponsePagePath":"/"}]},"DefaultRootObject":"","HttpVersion":"http2","IsIPV6Enabled":true,"Logging":{"Bucket":"cloudfront-***REMOVED***.s3.amazonaws.com","Enabled":true,"IncludeCookies":false,"Prefix":"dev.***REMOVED***.net"},"PriceClass":"PriceClass_All","Restrictions":{"GeoRestriction":{"Quantity":0,"RestrictionType":"none","Items":[]}},"WebACLId":"","ViewerCertificate":{"ACMCertificateArn":"arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3","CertificateSource":"acm","MinimumProtocolVersion":"TLSv1","SSLSupportMethod":"sni-only"}}});
    });

    it('should pass customErrorResponses for cloudfrontPaths parameter', () => {
      //Arrange
      const practiceConfig = {
        cname: 'dev.***REMOVED***.net',
        acmCertArn: 'arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3',
        comment: 'The Dev Environment for the ***REMOVED*** Front End',
        enableLogging: true,
        customErrorResponses: [
          {
            errorCode: 403, /* required */
            errorCachingMinTTL: 300,
            responseCode: '200',
            responsePagePath: '/'
          }
        ],
        cloudfrontPaths: [
          {
            originName: '***REMOVED*** Web - Dev',
            originDomainName: '***REMOVED***-web.s3-website-us-west-2.amazonaws.com',
            originPath: '',
            pathPattern: '/',
            originProtocolPolicy: 'http-only',
            viewerProtocolPolicy: 'redirect-to-https',
            queryString: true
          }
        ]
      };

      //Setting up CF clients
      const CloudFront = require('../src/cloudFrontClient');
      const cloudFrontClientService = new CloudFront();

      //Act
      const result = cloudFrontClientService._buildDistributionConfig(practiceConfig, 'abc123');

      //Assert
      expect(result).to.be.deep.equal({"DistributionConfig":{"CallerReference":"abc123","Comment":"The Dev Environment for the ***REMOVED*** Front End","DefaultCacheBehavior":{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":"redirect-to-https","AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false},"Enabled":true,"Origins":{"Quantity":1,"Items":[{"DomainName":"***REMOVED***-web.s3-website-us-west-2.amazonaws.com","Id":"***REMOVED*** Web - Dev","CustomHeaders":{"Quantity":0,"Items":[]},"CustomOriginConfig":{"HTTPPort":80,"HTTPSPort":443,"OriginProtocolPolicy":"http-only","OriginSslProtocols":{"Items":["TLSv1","TLSv1.1","TLSv1.2"],"Quantity":3}},"OriginPath":""}]},"Aliases":{"Quantity":1,"Items":["dev.***REMOVED***.net"]},"CacheBehaviors":{"Quantity":1,"Items":[{"ForwardedValues":{"Cookies":{"Forward":"none","WhitelistedNames":{"Quantity":0,"Items":[]}},"QueryString":true,"Headers":{"Quantity":6,"Items":["x-***REMOVED***-version","x-***REMOVED***-session","x-***REMOVED***-correlation","x-***REMOVED***-test","Content-Type","authorization"]},"QueryStringCacheKeys":{"Quantity":0,"Items":[]}},"MinTTL":0,"PathPattern":"/","TargetOriginId":"***REMOVED*** Web - Dev","TrustedSigners":{"Enabled":false,"Quantity":0,"Items":[]},"ViewerProtocolPolicy":'redirect-to-https',"AllowedMethods":{"Items":["POST","HEAD","PATCH","DELETE","PUT","GET","OPTIONS"],"Quantity":7,"CachedMethods":{"Items":["HEAD","GET","OPTIONS"],"Quantity":3}},"Compress":true,"DefaultTTL":0,"LambdaFunctionAssociations":{"Quantity":0,"Items":[]},"MaxTTL":0,"SmoothStreaming":false}]},"CustomErrorResponses":{"Quantity":1,"Items":[{"ErrorCode":403,"ErrorCachingMinTTL":300,"ResponseCode":"200","ResponsePagePath":"/"}]},"DefaultRootObject":"","HttpVersion":"http2","IsIPV6Enabled":true,"Logging":{"Bucket":"cloudfront-***REMOVED***.s3.amazonaws.com","Enabled":true,"IncludeCookies":false,"Prefix":"dev.***REMOVED***.net"},"PriceClass":"PriceClass_All","Restrictions":{"GeoRestriction":{"Quantity":0,"RestrictionType":"none","Items":[]}},"WebACLId":"","ViewerCertificate":{"ACMCertificateArn":"arn:aws:acm:us-east-1:***REMOVED***:certificate/9ea941bd-7ba7-4e5c-b944-e38d52ba39e3","CertificateSource":"acm","MinimumProtocolVersion":"TLSv1","SSLSupportMethod":"sni-only"}}});
    });
  });
});
