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
  });
});
