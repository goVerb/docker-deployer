const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const mockery = require('mockery');


require('sinon-as-promised');
chai.use(chaiAsPromised);


const sampleConfig1 = require('./sampleConfigs/sampleConfig.js');

describe('Deployer', function() {
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
    it('should pass accessKey, secretKey, and region to VPC client', () => {
      //Arrange
      let vpcClientStub = sandbox.stub();
      mockery.registerMock('./vpcClient.js', vpcClientStub);

      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      //Act
      const deployerInstance = new Deployer(deployerParams);

      //Assert
      expect(vpcClientStub.args[0][0]).to.be.equal(accessKey);
      expect(vpcClientStub.args[0][1]).to.be.equal(secretKey);
      expect(vpcClientStub.args[0][2]).to.be.equal(region);
    });

    it('should pass accessKey, secretKey, and region to EC2 client', () => {
      //Arrange
      let ec2ClientStub = sandbox.stub();
      mockery.registerMock('./ec2Client.js', ec2ClientStub);

      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      //Act
      const deployerInstance = new Deployer(deployerParams);
      //Assert
      expect(ec2ClientStub.args[0][0]).to.be.equal(accessKey);
      expect(ec2ClientStub.args[0][1]).to.be.equal(secretKey);
      expect(ec2ClientStub.args[0][2]).to.be.equal(region);
    });

    it('should pass accessKey, secretKey, and region to ECS client', () => {
      //Arrange
      let ecsClientStub = sandbox.stub();
      mockery.registerMock('./ecsClient.js', ecsClientStub);

      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      //Act
      const deployerInstance = new Deployer(deployerParams);

      //Assert
      expect(ecsClientStub.args[0][0]).to.be.equal(accessKey);
      expect(ecsClientStub.args[0][1]).to.be.equal(secretKey);
      expect(ecsClientStub.args[0][2]).to.be.equal(region);
    });

    it('should pass accessKey, secretKey, and region to ELB client', () => {
      //Arrange
      let elbClientStub = sandbox.stub();
      mockery.registerMock('./ecsClient.js', elbClientStub);

      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      //Act
      const deployerInstance = new Deployer(deployerParams);
      //Assert
      expect(elbClientStub.args[0][0]).to.be.equal(accessKey);
      expect(elbClientStub.args[0][1]).to.be.equal(secretKey);
      expect(elbClientStub.args[0][2]).to.be.equal(region);
    });

    it('should pass accessKey, secretKey, and region to AutoScaling client', () => {
      //Arrange
      let autoScalingClientStub = sandbox.stub();
      mockery.registerMock('./autoScalingClient.js', autoScalingClientStub);

      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      //Act
      const deployerInstance = new Deployer(deployerParams);

      //Assert
      expect(autoScalingClientStub.args[0][0]).to.be.equal(accessKey);
      expect(autoScalingClientStub.args[0][1]).to.be.equal(secretKey);
      expect(autoScalingClientStub.args[0][2]).to.be.equal(region);
    });

    it('should pass accessKey, secretKey, and region to Route53 client', () => {
      //Arrange
      let route53ClientMock = sandbox.stub();
      mockery.registerMock('./route53Client.js', route53ClientMock);

      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      //Act
      const deployerInstance = new Deployer(deployerParams);

      //Assert
      expect(route53ClientMock.args[0][0]).to.be.equal(accessKey);
      expect(route53ClientMock.args[0][1]).to.be.equal(secretKey);
      expect(route53ClientMock.args[0][2]).to.be.equal(region);
    });

    it('should pass accessKey and secretKey to CloudFront client', () => {
      //Arrange
      let cloudFrontClientMock = sandbox.stub();
      mockery.registerMock('./cloudFrontClient.js', cloudFrontClientMock);

      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-4';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      //Act
      const deployerInstance = new Deployer(deployerParams);

      //Assert
      expect(cloudFrontClientMock.args[0][0]).to.be.equal(accessKey);
      expect(cloudFrontClientMock.args[0][1]).to.be.equal(secretKey);
    });

    it('should pass accessKey, secretKey, and region to CloudWatch client', () => {
      //Arrange
      let cloudWatchClientStub = sandbox.stub();
      mockery.registerMock('./cloudWatchClient.js', cloudWatchClientStub);

      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      //Act
      const deployerInstance = new Deployer(deployerParams);

      //Assert
      expect(cloudWatchClientStub.args[0][0]).to.be.equal(accessKey);
      expect(cloudWatchClientStub.args[0][1]).to.be.equal(secretKey);
      expect(cloudWatchClientStub.args[0][2]).to.be.equal(region);
    });

    it('should pass accessKey, secretKey, and region to ApplicationAutoScaling client', () => {
      //Arrange
      let applicationAutoScalingStub = sandbox.stub();
      mockery.registerMock('./applicationAutoScalingClient.js', applicationAutoScalingStub);

      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      //Act
      const deployerInstance = new Deployer(deployerParams);

      //Assert
      expect(applicationAutoScalingStub.args[0][0]).to.be.equal(accessKey);
      expect(applicationAutoScalingStub.args[0][1]).to.be.equal(secretKey);
      expect(applicationAutoScalingStub.args[0][2]).to.be.equal(region);
    });
  });

  describe('createInfrastructure', () => {
    let vpcClientStub;
    let ec2ClientStub;
    let ecsClientStub;
    let elbClientStub;
    let autoScaleClientStub;
    let route53ClientStub;
    beforeEach(() => {

      vpcClientStub = {
        createVpcFromConfig: sandbox.stub().resolves(),
        getVpcIdFromName: sandbox.stub().resolves()
      };

      ecsClientStub = {
        createCluster: sandbox.stub().resolves()
      };

      ec2ClientStub = sandbox.stub();
      elbClientStub = sandbox.stub();
      autoScaleClientStub = sandbox.stub();
      route53ClientStub = sandbox.stub();

      mockery.registerMock('./vpcClient.js', () => {
            return vpcClientStub;
        });
      mockery.registerMock('./elbClient.js', elbClientStub);
      mockery.registerMock('./autoScalingClient.js', autoScaleClientStub);
      mockery.registerMock('./ec2Client.js', ec2ClientStub);
      mockery.registerMock('./ecsClient.js', () => {
        return ecsClientStub;
      });
      mockery.registerMock('./route53Client.js', route53ClientStub);

    });

    it('should call _vpcClient.createVpcConfig once', () => {

      //Arrange
      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let _createOrUpdateLaunchConfigurationStub = { newLaunchConfigName: 'new', oldLaunchConfigName: 'old' };

      let deployerClient = new Deployer(deployerParams);
      deployerClient._createSecurityGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateLaunchConfiguration = sandbox.stub().resolves(_createOrUpdateLaunchConfigurationStub);
      deployerClient.createS3BucketIfNecessary = sandbox.stub().resolves();
      deployerClient._createTargetGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateAutoScaleGroup = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancer = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancerListener = sandbox.stub().resolves();
      deployerClient._createDNSEntryForApplicationLoadBalancer = sandbox.stub().resolves();


      //Act
      let resultPromise = deployerClient.createInfrastructure(sampleConfig1);


      //Assert
      return resultPromise.then(() => {
        expect(vpcClientStub.createVpcFromConfig.calledOnce).to.be.true;
      });
    });

    it('should call _createOrUpdateLaunchConfiguration once', () => {
      //Arrange
      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let _createOrUpdateLaunchConfigurationStub = { newLaunchConfigName: 'new', oldLaunchConfigName: 'old' };

      let deployerClient = new Deployer(deployerParams);
      deployerClient._createSecurityGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateLaunchConfiguration = sandbox.stub().resolves(_createOrUpdateLaunchConfigurationStub);
      deployerClient.createS3BucketIfNecessary = sandbox.stub().resolves();
      deployerClient._createTargetGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateAutoScaleGroup = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancer = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancerListener = sandbox.stub().resolves();
      deployerClient._createDNSEntryForApplicationLoadBalancer = sandbox.stub().resolves();


      //Act
      let resultPromise = deployerClient.createInfrastructure(sampleConfig1);


      //Assert
      return resultPromise.then(() => {
        expect(deployerClient._createOrUpdateLaunchConfiguration.calledOnce).to.be.true;
      });
    });

    it('should call _createTargetGroup once', () => {
      //Arrange
      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let _createOrUpdateLaunchConfigurationStub = { newLaunchConfigName: 'new', oldLaunchConfigName: 'old' };

      let deployerClient = new Deployer(deployerParams);
      deployerClient._createSecurityGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateLaunchConfiguration = sandbox.stub().resolves(_createOrUpdateLaunchConfigurationStub);
      deployerClient.createS3BucketIfNecessary = sandbox.stub().resolves();
      deployerClient._createTargetGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateAutoScaleGroup = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancer = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancerListener = sandbox.stub().resolves();
      deployerClient._createDNSEntryForApplicationLoadBalancer = sandbox.stub().resolves();


      //Act
      let resultPromise = deployerClient.createInfrastructure(sampleConfig1);


      //Assert
      return resultPromise.then(() => {
        expect(deployerClient._createTargetGroup.calledOnce).to.be.true;
      });
    });

    it('should call _createOrUpdateAutoScaleGroup once', () => {
      //Arrange
      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let _createOrUpdateLaunchConfigurationStub = { newLaunchConfigName: 'new', oldLaunchConfigName: 'old' };

      let deployerClient = new Deployer(deployerParams);
      deployerClient._createSecurityGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateLaunchConfiguration = sandbox.stub().resolves(_createOrUpdateLaunchConfigurationStub);
      deployerClient.createS3BucketIfNecessary = sandbox.stub().resolves();
      deployerClient._createTargetGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateAutoScaleGroup = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancer = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancerListener = sandbox.stub().resolves();
      deployerClient._createDNSEntryForApplicationLoadBalancer = sandbox.stub().resolves();


      //Act
      let resultPromise = deployerClient.createInfrastructure(sampleConfig1);


      //Assert
      return resultPromise.then(() => {
        expect(deployerClient._createOrUpdateAutoScaleGroup.calledOnce).to.be.true;
      });
    });

    it('should call _createApplicationLoadBalancer once', () => {
      //Arrange
      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let _createOrUpdateLaunchConfigurationStub = { newLaunchConfigName: 'new', oldLaunchConfigName: 'old' };

      let deployerClient = new Deployer(deployerParams);
      deployerClient._createSecurityGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateLaunchConfiguration = sandbox.stub().resolves(_createOrUpdateLaunchConfigurationStub);
      deployerClient.createS3BucketIfNecessary = sandbox.stub().resolves();
      deployerClient._createTargetGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateAutoScaleGroup = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancer = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancerListener = sandbox.stub().resolves();
      deployerClient._createDNSEntryForApplicationLoadBalancer = sandbox.stub().resolves();


      //Act
      let resultPromise = deployerClient.createInfrastructure(sampleConfig1);


      //Assert
      return resultPromise.then(() => {
        expect(deployerClient._createApplicationLoadBalancer.calledOnce).to.be.true;
      });
    });

    it('should call _createApplicationLoadBalancerListener once', () => {
      //Arrange
      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let _createOrUpdateLaunchConfigurationStub = { newLaunchConfigName: 'new', oldLaunchConfigName: 'old' };

      let deployerClient = new Deployer(deployerParams);
      deployerClient._createSecurityGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateLaunchConfiguration = sandbox.stub().resolves(_createOrUpdateLaunchConfigurationStub);
      deployerClient.createS3BucketIfNecessary = sandbox.stub().resolves();
      deployerClient._createTargetGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateAutoScaleGroup = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancer = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancerListener = sandbox.stub().resolves();
      deployerClient._createDNSEntryForApplicationLoadBalancer = sandbox.stub().resolves();


      //Act
      let resultPromise = deployerClient.createInfrastructure(sampleConfig1);


      //Assert
      return resultPromise.then(() => {
        expect(deployerClient._createApplicationLoadBalancerListener.calledOnce).to.be.true;
      });
    });

    it('should call _createDNSEntryForApplicationLoadBalancer once', () => {
      //Arrange
      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let _createOrUpdateLaunchConfigurationStub = { newLaunchConfigName: 'new', oldLaunchConfigName: 'old' };

      let deployerClient = new Deployer(deployerParams);
      deployerClient._createSecurityGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateLaunchConfiguration = sandbox.stub().resolves(_createOrUpdateLaunchConfigurationStub);
      deployerClient.createS3BucketIfNecessary = sandbox.stub().resolves();
      deployerClient._createTargetGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateAutoScaleGroup = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancer = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancerListener = sandbox.stub().resolves();
      deployerClient._createDNSEntryForApplicationLoadBalancer = sandbox.stub().resolves();


      //Act
      let resultPromise = deployerClient.createInfrastructure(sampleConfig1);


      //Assert
      return resultPromise.then(() => {
        expect(deployerClient._createDNSEntryForApplicationLoadBalancer.calledOnce).to.be.true;
      });
    });

    it('should call _ecsClient.createCluster once', () => {
      //Arrange
      //Setting up Deployer clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let _createOrUpdateLaunchConfigurationStub = { newLaunchConfigName: 'new', oldLaunchConfigName: 'old' };

      let deployerClient = new Deployer(deployerParams);
      deployerClient._createSecurityGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateLaunchConfiguration = sandbox.stub().resolves(_createOrUpdateLaunchConfigurationStub);
      deployerClient.createS3BucketIfNecessary = sandbox.stub().resolves();
      deployerClient._createTargetGroup = sandbox.stub().resolves();
      deployerClient._createOrUpdateAutoScaleGroup = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancer = sandbox.stub().resolves();
      deployerClient._createApplicationLoadBalancerListener = sandbox.stub().resolves();
      deployerClient._createDNSEntryForApplicationLoadBalancer = sandbox.stub().resolves();


      //Act
      let resultPromise = deployerClient.createInfrastructure(sampleConfig1);


      //Assert
      return resultPromise.then(() => {
        expect(ecsClientStub.createCluster.calledOnce).to.be.true;
      });
    });
  });

  describe('_createApplicationLoadBalancerListener', () => {
    describe('should handle listenerConfig which is a single object', () => {
      let vpcClientStub;
      let ec2ClientStub;
      let ecsClientStub;
      let elbClientStub;
      let autoScaleClientStub;
      let route53ClientStub;
      let cloudfrontClientStub;
      beforeEach(() => {

        vpcClientStub = sandbox.stub();
        ecsClientStub = sandbox.stub();
        ec2ClientStub = sandbox.stub();
        elbClientStub = {
          getApplicationLoadBalancerArnFromName: sandbox.stub().resolves(),
          getTargetGroupArnFromName: sandbox.stub().resolves(),
          createListener: sandbox.stub().resolves()
        };
        autoScaleClientStub = sandbox.stub();
        route53ClientStub = sandbox.stub();
        cloudfrontClientStub = sandbox.stub();

        mockery.registerMock('./vpcClient.js', vpcClientStub);
        mockery.registerMock('./elbClient.js', () => {
          return elbClientStub;
        });
        mockery.registerMock('./cloudFrontClient.js', cloudfrontClientStub);
        mockery.registerMock('./autoScalingClient.js', autoScaleClientStub);
        mockery.registerMock('./ec2Client.js', ec2ClientStub);
        mockery.registerMock('./ecsClient.js', ecsClientStub);
        mockery.registerMock('./route53Client.js', route53ClientStub);

      });

      it('should call getApplicationLoadBalancerArnFromName once', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = {
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        };

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getApplicationLoadBalancerArnFromName.calledOnce).to.be.true;
        });
      });

      it('should pass loadBalancer name to getApplicationLoadBalancerArnFromName', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = {
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        };

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getApplicationLoadBalancerArnFromName.args[0][0]).to.be.equal(listenerConfig.loadBalancerName);
        });
      });

      it('should call getTargetGroupArnFromName once', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = {
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        };

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getTargetGroupArnFromName.calledOnce).to.be.true;
        });
      });

      it('should pass targetGroupName name to getTargetGroupArnFromName', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = {
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        };

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getTargetGroupArnFromName.args[0][0]).to.be.equal(listenerConfig.targetGroupName);
        });
      });

      it('should call createListener once', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = {
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        };

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.createListener.calledOnce).to.be.true;
        });
      });

      it('should pass loadBalancerArn, targetGroupArn, protocol, and port to createListener', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = {
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        };

        let loadBalanceArn = 'somethingArn';
        elbClientStub.getApplicationLoadBalancerArnFromName = sandbox.stub();
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig.loadBalancerName).resolves(loadBalanceArn);

        let targetGroupArn = 'targetGroupArn';
        elbClientStub.getTargetGroupArnFromName = sandbox.stub();
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig.targetGroupName).resolves(targetGroupArn);


        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.createListener.args[0][0]).to.be.equal(loadBalanceArn);
          expect(elbClientStub.createListener.args[0][1]).to.be.equal(targetGroupArn);
          expect(elbClientStub.createListener.args[0][2]).to.be.equal(listenerConfig.protocol);
          expect(elbClientStub.createListener.args[0][3]).to.be.equal(listenerConfig.port);
        });
      });

      it('should pass empty array for certificates when certificateArn is empty to createListener if exist', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = {
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80,
          certificateArn: ''
        };

        let loadBalanceArn = 'somethingArn';
        elbClientStub.getApplicationLoadBalancerArnFromName = sandbox.stub();
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig.loadBalancerName).resolves(loadBalanceArn);

        let targetGroupArn = 'targetGroupArn';
        elbClientStub.getTargetGroupArnFromName = sandbox.stub();
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig.targetGroupName).resolves(targetGroupArn);


        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.createListener.args[0][4]).to.be.deep.equal([]);
        });
      });

      it('should pass valid array for certificates when certificateArn is populated to createListener if exist', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = {
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80,
          certificateArn: 'arn:aws:acm:us-west-2:a123213123:certificate/904-20bc-dddd-82a3-eeeeeee'
        };

        let loadBalanceArn = 'somethingArn';
        elbClientStub.getApplicationLoadBalancerArnFromName = sandbox.stub();
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig.loadBalancerName).resolves(loadBalanceArn);

        let targetGroupArn = 'targetGroupArn';
        elbClientStub.getTargetGroupArnFromName = sandbox.stub();
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig.targetGroupName).resolves(targetGroupArn);


        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          let expectedValue = [
            {CertificateArn: listenerConfig.certificateArn}
          ];

          expect(elbClientStub.createListener.args[0][4]).to.be.deep.equal(expectedValue);
        });
      });
    });

    describe('should handle listenerConfig that is an array of a single object', () => {
      let vpcClientStub;
      let ec2ClientStub;
      let ecsClientStub;
      let elbClientStub;
      let autoScaleClientStub;
      let route53ClientStub;
      beforeEach(() => {

        vpcClientStub = sandbox.stub();
        ecsClientStub = sandbox.stub();
        ec2ClientStub = sandbox.stub();
        elbClientStub = {
          getApplicationLoadBalancerArnFromName: sandbox.stub().resolves(),
          getTargetGroupArnFromName: sandbox.stub().resolves(),
          createListener: sandbox.stub().resolves()
        };
        autoScaleClientStub = sandbox.stub();
        route53ClientStub = sandbox.stub();

        mockery.registerMock('./vpcClient.js', vpcClientStub);
        mockery.registerMock('./elbClient.js', () => {
          return elbClientStub;
        });
        mockery.registerMock('./autoScalingClient.js', autoScaleClientStub);
        mockery.registerMock('./ec2Client.js', ec2ClientStub);
        mockery.registerMock('./ecsClient.js', ecsClientStub);
        mockery.registerMock('./route53Client.js', route53ClientStub);

      });

      it('should call getApplicationLoadBalancerArnFromName once', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getApplicationLoadBalancerArnFromName.calledOnce).to.be.true;
        });
      });

      it('should pass loadBalancer name to getApplicationLoadBalancerArnFromName', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getApplicationLoadBalancerArnFromName.args[0][0]).to.be.equal(listenerConfig[0].loadBalancerName);
        });
      });

      it('should call getTargetGroupArnFromName once', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getTargetGroupArnFromName.calledOnce).to.be.true;
        });
      });

      it('should pass targetGroupName name to getTargetGroupArnFromName', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getTargetGroupArnFromName.args[0][0]).to.be.equal(listenerConfig[0].targetGroupName);
        });
      });

      it('should call createListener once', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.createListener.calledOnce).to.be.true;
        });
      });

      it('should pass loadBalancerArn, targetGroupArn, protocol, and port to createListener', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        }];

        let loadBalanceArn = 'somethingArn';
        elbClientStub.getApplicationLoadBalancerArnFromName = sandbox.stub();
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig[0].loadBalancerName).resolves(loadBalanceArn);

        let targetGroupArn = 'targetGroupArn';
        elbClientStub.getTargetGroupArnFromName = sandbox.stub();
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig[0].targetGroupName).resolves(targetGroupArn);


        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.createListener.args[0][0]).to.be.equal(loadBalanceArn);
          expect(elbClientStub.createListener.args[0][1]).to.be.equal(targetGroupArn);
          expect(elbClientStub.createListener.args[0][2]).to.be.equal(listenerConfig[0].protocol);
          expect(elbClientStub.createListener.args[0][3]).to.be.equal(listenerConfig[0].port);
        });
      });

      it('should pass empty array for certificates when certificateArn is empty to createListener if exist', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80,
          certificateArn: ''
        }];

        let loadBalanceArn = 'somethingArn';
        elbClientStub.getApplicationLoadBalancerArnFromName = sandbox.stub();
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig.loadBalancerName).resolves(loadBalanceArn);

        let targetGroupArn = 'targetGroupArn';
        elbClientStub.getTargetGroupArnFromName = sandbox.stub();
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig.targetGroupName).resolves(targetGroupArn);


        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.createListener.args[0][4]).to.be.deep.equal([]);
        });
      });

      it('should pass valid array for certificates when certificateArn is populated to createListener if exist', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80,
          certificateArn: 'arn:aws:acm:us-west-2:a123213123:certificate/904-20bc-dddd-82a3-eeeeeee'
        }];

        let loadBalanceArn = 'somethingArn';
        elbClientStub.getApplicationLoadBalancerArnFromName = sandbox.stub();
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig.loadBalancerName).resolves(loadBalanceArn);

        let targetGroupArn = 'targetGroupArn';
        elbClientStub.getTargetGroupArnFromName = sandbox.stub();
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig.targetGroupName).resolves(targetGroupArn);


        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          let expectedValue = [
            {CertificateArn: listenerConfig[0].certificateArn}
          ];

          expect(elbClientStub.createListener.args[0][4]).to.be.deep.equal(expectedValue);
        });
      });
    });

    describe('should handle a listenerConfig that is an array of multiple objects', () => {
      let vpcClientStub;
      let ec2ClientStub;
      let ecsClientStub;
      let elbClientStub;
      let autoScaleClientStub;
      let route53ClientStub;
      beforeEach(() => {

        vpcClientStub = sandbox.stub();
        ecsClientStub = sandbox.stub();
        ec2ClientStub = sandbox.stub();
        elbClientStub = {
          getApplicationLoadBalancerArnFromName: sandbox.stub().resolves(),
          getTargetGroupArnFromName: sandbox.stub().resolves(),
          createListener: sandbox.stub().resolves()
        };
        autoScaleClientStub = sandbox.stub();
        route53ClientStub = sandbox.stub();

        mockery.registerMock('./vpcClient.js', vpcClientStub);
        mockery.registerMock('./elbClient.js', () => {
          return elbClientStub;
        });
        mockery.registerMock('./autoScalingClient.js', autoScaleClientStub);
        mockery.registerMock('./ec2Client.js', ec2ClientStub);
        mockery.registerMock('./ecsClient.js', ecsClientStub);
        mockery.registerMock('./route53Client.js', route53ClientStub);

      });

      it('should call getApplicationLoadBalancerArnFromName once for each listenerConfig', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        },{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTPS',
          port: 443
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getApplicationLoadBalancerArnFromName.callCount).to.be.equal(2);
        });
      });

      it('should pass loadBalancer name to getApplicationLoadBalancerArnFromName for each listener', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        },{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTPS',
          port: 443
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getApplicationLoadBalancerArnFromName.args[0][0]).to.be.equal(listenerConfig[0].loadBalancerName);
          expect(elbClientStub.getApplicationLoadBalancerArnFromName.args[1][0]).to.be.equal(listenerConfig[1].loadBalancerName);
        });
      });

      it('should call getTargetGroupArnFromName once for each listenerConfig', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        },{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTPS',
          port: 443
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getTargetGroupArnFromName.callCount).to.be.equal(2);
        });
      });

      it('should pass targetGroupName name to getTargetGroupArnFromName for each listener', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        },{
          loadBalancerName: 'testName2',
          targetGroupName: 'testTargetGroupName2',
          protocol: 'HTTPS',
          port: 443
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.getTargetGroupArnFromName.args[0][0]).to.be.equal(listenerConfig[0].targetGroupName);
          expect(elbClientStub.getTargetGroupArnFromName.args[1][0]).to.be.equal(listenerConfig[1].targetGroupName);
        });
      });

      it('should call createListener once for each listenerConfig', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTP',
          port: 80
        },{
          loadBalancerName: 'testName',
          targetGroupName: 'testTargetGroupName',
          protocol: 'HTTPS',
          port: 443
        }];

        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.createListener.callCount).to.be.equal(2);
        });
      });

      it('should pass loadBalancerArn, targetGroupArn, protocol, and port to createListener for each listenerConfig', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName1',
          targetGroupName: 'testTargetGroupName1',
          protocol: 'HTTP',
          port: 80
        },{
          loadBalancerName: 'testName2',
          targetGroupName: 'testTargetGroupName2',
          protocol: 'HTTPS',
          port: 443
        }];

        let loadBalanceArn1 = 'somethingArn1';
        let loadBalanceArn2 = 'somethingArn2';
        elbClientStub.getApplicationLoadBalancerArnFromName = sandbox.stub();
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig[0].loadBalancerName).resolves(loadBalanceArn1);
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig[1].loadBalancerName).resolves(loadBalanceArn2);

        let targetGroupArn1 = 'targetGroupArn1';
        let targetGroupArn2 = 'targetGroupArn2';
        elbClientStub.getTargetGroupArnFromName = sandbox.stub();
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig[0].targetGroupName).resolves(targetGroupArn1);
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig[1].targetGroupName).resolves(targetGroupArn2);


        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.createListener.args[0][0]).to.be.equal(loadBalanceArn1);
          expect(elbClientStub.createListener.args[0][1]).to.be.equal(targetGroupArn1);
          expect(elbClientStub.createListener.args[0][2]).to.be.equal(listenerConfig[0].protocol);
          expect(elbClientStub.createListener.args[0][3]).to.be.equal(listenerConfig[0].port);

          expect(elbClientStub.createListener.args[1][0]).to.be.equal(loadBalanceArn2);
          expect(elbClientStub.createListener.args[1][1]).to.be.equal(targetGroupArn2);
          expect(elbClientStub.createListener.args[1][2]).to.be.equal(listenerConfig[1].protocol);
          expect(elbClientStub.createListener.args[1][3]).to.be.equal(listenerConfig[1].port);
        });
      });

      it('should pass empty array for certificates when certificateArn is empty to createListener if exist', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName1',
          targetGroupName: 'testTargetGroupName1',
          protocol: 'HTTP',
          port: 80
        },{
          loadBalancerName: 'testName2',
          targetGroupName: 'testTargetGroupName2',
          protocol: 'HTTPS',
          port: 443
        }];

        let loadBalanceArn = 'somethingArn';
        elbClientStub.getApplicationLoadBalancerArnFromName = sandbox.stub();
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig.loadBalancerName).resolves(loadBalanceArn);

        let targetGroupArn = 'targetGroupArn';
        elbClientStub.getTargetGroupArnFromName = sandbox.stub();
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig.targetGroupName).resolves(targetGroupArn);


        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          expect(elbClientStub.createListener.args[0][4]).to.be.deep.equal([]);

          expect(elbClientStub.createListener.args[1][4]).to.be.deep.equal([]);
        });
      });

      it('should pass valid array for certificates when certificateArn is populated to createListener if exist', () => {
        //Arrange
        //Setting up Deployer clients
        const accessKey = 'acckey';
        const secretKey = 'secret';
        const region = 'us-west-2';

        const Deployer = require('../src/index');
        const deployerParams = {
          accessKey: accessKey,
          secretKey: secretKey,
          region: region
        };

        let deployerClient = new Deployer(deployerParams);
        let listenerConfig = [{
          loadBalancerName: 'testName1',
          targetGroupName: 'testTargetGroupName1',
          protocol: 'HTTP',
          port: 80
        },{
          loadBalancerName: 'testName2',
          targetGroupName: 'testTargetGroupName2',
          protocol: 'HTTPS',
          port: 443,
          certificateArn: 'arn:aws:acm:us-west-2:a123213123:certificate/904-20bc-dddd-82a3-eeeeeee'
        }];

        let loadBalanceArn = 'somethingArn';
        elbClientStub.getApplicationLoadBalancerArnFromName = sandbox.stub();
        elbClientStub.getApplicationLoadBalancerArnFromName.withArgs(listenerConfig.loadBalancerName).resolves(loadBalanceArn);

        let targetGroupArn = 'targetGroupArn';
        elbClientStub.getTargetGroupArnFromName = sandbox.stub();
        elbClientStub.getTargetGroupArnFromName.withArgs(listenerConfig.targetGroupName).resolves(targetGroupArn);


        //Act
        let resultPromise = deployerClient._createApplicationLoadBalancerListener(listenerConfig);

        //Assert
        return resultPromise.then(() => {
          let expectedValue = [
            {CertificateArn: listenerConfig[1].certificateArn}
          ];

          expect(elbClientStub.createListener.args[0][4]).to.be.deep.equal([]);

          expect(elbClientStub.createListener.args[1][4]).to.be.deep.equal(expectedValue);
        });
      });
    });
  });

  describe('lookupApiGatewayByName', () => {
    let vpcClientStub;
    let ec2ClientStub;
    let ecsClientStub;
    let elbClientStub;
    let autoScaleClientStub;
    let route53ClientStub;
    let apiClientStub;
    beforeEach(() => {

      vpcClientStub = sandbox.stub();
      ecsClientStub = sandbox.stub();
      ec2ClientStub = sandbox.stub();
      elbClientStub = sandbox.stub();
      apiClientStub = {
        lookupApiGatewayByName: sandbox.stub()
      };
      autoScaleClientStub = sandbox.stub();
      route53ClientStub = sandbox.stub();

      mockery.registerMock('./vpcClient.js', vpcClientStub);
      mockery.registerMock('./elbClient.js', () => {
        return elbClientStub;
      });
      mockery.registerMock('./autoScalingClient.js', autoScaleClientStub);
      mockery.registerMock('./ec2Client.js', ec2ClientStub);
      mockery.registerMock('./ecsClient.js', ecsClientStub);
      mockery.registerMock('./route53Client.js', route53ClientStub);
      mockery.registerMock('./apiGatewayClient',() => apiClientStub);
    });
    it('should call lookupApiGatewayByName', () => {
      //Arrange
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let deployerClient = new Deployer(deployerParams);
      //Act
      deployerClient.lookupApiGatewayByName('name')
      //Assert
      expect(apiClientStub.lookupApiGatewayByName.calledOnce).to.be.true;
    });
    it('should pass name param to lookupApiGatewayByName', () => {
      //Arrange
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let deployerClient = new Deployer(deployerParams);
      //Act
      deployerClient.lookupApiGatewayByName('name')

      expect(apiClientStub.lookupApiGatewayByName.args[0][0]).to.equal('name');
    });
  });

  describe('createOrOverwriteApiSwagger', () => {
    let vpcClientStub;
    let ec2ClientStub;
    let ecsClientStub;
    let elbClientStub;
    let autoScaleClientStub;
    let route53ClientStub;
    let apiClientStub;
    beforeEach(() => {

      vpcClientStub = sandbox.stub();
      ecsClientStub = sandbox.stub();
      ec2ClientStub = sandbox.stub();
      elbClientStub = sandbox.stub();
      apiClientStub = {
        createOrOverwriteApiSwagger: sandbox.stub()
      };
      autoScaleClientStub = sandbox.stub();
      route53ClientStub = sandbox.stub();

      mockery.registerMock('./vpcClient.js', vpcClientStub);
      mockery.registerMock('./elbClient.js', () => {
        return elbClientStub;
      });
      mockery.registerMock('./autoScalingClient.js', autoScaleClientStub);
      mockery.registerMock('./ec2Client.js', ec2ClientStub);
      mockery.registerMock('./ecsClient.js', ecsClientStub);
      mockery.registerMock('./route53Client.js', route53ClientStub);
      mockery.registerMock('./apiGatewayClient',() => apiClientStub);
    });
    it('should call createOrOverwriteApiSwagger', () => {
      //Arrange
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let deployerClient = new Deployer(deployerParams);
      //Act
      deployerClient.createOrOverwriteApiSwagger('name')
      //Assert
      expect(apiClientStub.createOrOverwriteApiSwagger.calledOnce).to.be.true;
    });
    it('should pass name param to createOrOverwriteApiSwagger', () => {
      //Arrange
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-2';

      const Deployer = require('../src/index');
      const deployerParams = {
        accessKey: accessKey,
        secretKey: secretKey,
        region: region
      };

      let deployerClient = new Deployer(deployerParams);
      //Act
      deployerClient.createOrOverwriteApiSwagger({info: {title: 'dang'}})

      expect(apiClientStub.createOrOverwriteApiSwagger.args[0][0]).to.deep.equal({info: {title: 'dang'}});
    });
  });
});
