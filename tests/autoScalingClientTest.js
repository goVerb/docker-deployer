const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const mockery = require('mockery');
const __ = require('lodash');
const BluebirdPromise = require('bluebird');
const base64 = require('base-64');
const moment = require('moment');


require('sinon-as-promised');
chai.use(chaiAsPromised);




describe('Auto Scaling Client', function() {
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


  describe('getter _awsAutoScalingClient', () => {
    it('should pass accessKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up AutoScaling clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling(accessKey, secretKey, region);


      //Act
      autoScalingClientService._awsAutoScalingClient;

      //Assert
      let params = mockAwsSdk.AutoScaling.args[0][0];
      expect(params).to.have.property('accessKeyId', accessKey);
    });

    it('should pass secretKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up AutoScaling clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling(accessKey, secretKey, region);


      //Act
      autoScalingClientService._awsAutoScalingClient;

      //Assert
      let params = mockAwsSdk.AutoScaling.args[0][0];
      expect(params).to.have.property('secretAccessKey', secretKey);
    });

    it('should pass region to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up AutoScaling clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling(accessKey, secretKey, region);


      //Act
      autoScalingClientService._awsAutoScalingClient;

      //Assert
      let params = mockAwsSdk.AutoScaling.args[0][0];
      expect(params).to.have.property('region', region);
    });

    it('should pass default region of us-west-2 if none specified', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: sandbox.stub()

      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up AutoScaling clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling(accessKey, secretKey);


      //Act
      autoScalingClientService._awsAutoScalingClient;

      //Assert
      let params = mockAwsSdk.AutoScaling.args[0][0];
      expect(params).to.have.property('region', 'us-west-2');
    });
  });


  describe('createOrUpdateLaunchConfigurationFromConfig', () => {
    it('should pass name to getLaunchConfiguration method', () => {
      //Arrange

      const launchConfigurationConfig = {
        name: 'LCName',
        baseImageId: 'ami-abc123test',
        securityGroupId: 'sg-123abctest',
        instanceType: 't2.micro',
        ecsClusterName: 'Test Cluster'
      };

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getLaunchConfiguration = sandbox.stub().resolves('');
      autoScalingClientService._createOrUpdateLaunchConfiguration = sandbox.stub().resolves({});


      //Act
      let resultPromise = autoScalingClientService.createOrUpdateLaunchConfigurationFromConfig(launchConfigurationConfig);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService.getLaunchConfiguration.args[0][0]).to.be.equal(launchConfigurationConfig.name);
      });
    });

    it('should call _createOrUpdateLaunchConfiguration once if launchConfiguration doesnt exist', () => {
      //Arrange

      const launchConfigurationConfig = {
        name: 'LCName',
        baseImageId: 'ami-abc123test',
        securityGroupId: 'sg-123abctest',
        instanceType: 't2.micro',
        ecsClusterName: 'Test Cluster'
      };

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getLaunchConfiguration = sandbox.stub().resolves('');
      autoScalingClientService._createOrUpdateLaunchConfiguration = sandbox.stub().resolves({});


      //Act
      let resultPromise = autoScalingClientService.createOrUpdateLaunchConfigurationFromConfig(launchConfigurationConfig);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._createOrUpdateLaunchConfiguration.callCount).to.be.equal(1);
      });
    });

    it('should call _createOrUpdateLaunchConfiguration if launchConfiguration already exists and is out of date', () => {
      //Arrange

      const launchConfigurationConfig = {
        name: 'LCName',
        baseImageId: 'ami-abc123test',
        securityGroupId: 'sg-123abctest',
        instanceType: 't2.micro',
        ecsClusterName: 'Test Cluster'
      };

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getLaunchConfiguration = sandbox.stub().resolves('launchConfigurationArn');
      autoScalingClientService._createOrUpdateLaunchConfiguration = sandbox.stub().resolves({});
      autoScalingClientService._newLaunchConfigurationName = sandbox.stub().returns('LCName - v1');
      autoScalingClientService._isLaunchConfigurationOutOfDate = sandbox.stub().returns(true);


      //Act
      let resultPromise = autoScalingClientService.createOrUpdateLaunchConfigurationFromConfig(launchConfigurationConfig);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._createOrUpdateLaunchConfiguration.callCount).to.be.equal(1);
      });
    });

    it('should not call _createOrUpdateLaunchConfiguration if launchConfiguration already exists and is up to date', () => {
      //Arrange

      const launchConfigurationConfig = {
        name: 'LCName',
        baseImageId: 'ami-abc123test',
        securityGroupId: 'sg-123abctest',
        instanceType: 't2.micro',
        ecsClusterName: 'Test Cluster'
      };

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getLaunchConfiguration = sandbox.stub().resolves('launchConfigurationArn');
      autoScalingClientService._createOrUpdateLaunchConfiguration = sandbox.stub().resolves({});
      autoScalingClientService._newLaunchConfigurationName = sandbox.stub().returns('LCName - v1');
      autoScalingClientService._isLaunchConfigurationOutOfDate = sandbox.stub().returns(false);


      //Act
      let resultPromise = autoScalingClientService.createOrUpdateLaunchConfigurationFromConfig(launchConfigurationConfig);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._createOrUpdateLaunchConfiguration.callCount).to.be.equal(0);
      });
    });

    it('should pass parameters to _createOrUpdateLaunchConfiguration', () => {
      //Arrange

      const launchConfigurationConfig = {
        name: 'LCName',
        baseImageId: 'ami-abc123test',
        securityGroupId: 'sg-123abctest',
        instanceType: 't2.micro',
        ecsClusterName: 'Test Cluster'
      };

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getLaunchConfiguration = sandbox.stub().resolves('');
      autoScalingClientService._createOrUpdateLaunchConfiguration = sandbox.stub().resolves({});


      //Act
      let resultPromise = autoScalingClientService.createOrUpdateLaunchConfigurationFromConfig(launchConfigurationConfig);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._createOrUpdateLaunchConfiguration.args[0][0]).to.be.equal(launchConfigurationConfig.name);
        expect(autoScalingClientService._createOrUpdateLaunchConfiguration.args[0][1]).to.be.equal(launchConfigurationConfig.baseImageId);
        expect(autoScalingClientService._createOrUpdateLaunchConfiguration.args[0][2]).to.be.equal(launchConfigurationConfig.securityGroupId);
        expect(autoScalingClientService._createOrUpdateLaunchConfiguration.args[0][3]).to.be.equal(launchConfigurationConfig.instanceType);
        expect(autoScalingClientService._createOrUpdateLaunchConfiguration.args[0][4]).to.be.undefined;
        expect(autoScalingClientService._createOrUpdateLaunchConfiguration.args[0][5]).to.be.equal(launchConfigurationConfig.ecsClusterName);

      });
    });
  });


  describe('_isLaunchConfigurationOutOfDate', () => {
    it('should return false if everything is the same', () => {
      //Arrange
      const launchConfigurationConfig = {
        name: 'LCName',
        baseImageId: 'ami-abc123test',
        securityGroupId: 'sg-123abctest',
        instanceType: 't2.micro'
      };

      const foundLaunchConfiguration = {
        name: 'LCName',
        ImageId: 'ami-abc123test',
        SecurityGroups: [ 'sg-123abctest' ],
        InstanceType: 't2.micro'
      };

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      //Act
      let result = autoScalingClientService._isLaunchConfigurationOutOfDate(launchConfigurationConfig, foundLaunchConfiguration);

      //Assert
      expect(result).to.be.false;
    });

    it('should return true if baseImageId !== foundLaunchConfiguration.ImageId', () => {
      //Arrange
      const launchConfigurationConfig = {
        name: 'LCName',
        baseImageId: 'ami-abc123test',
        securityGroupId: 'sg-123abctest',
        instanceType: 't2.micro'
      };

      const foundLaunchConfiguration = {
        name: 'LCName',
        ImageId: 'different',
        SecurityGroups: [ 'sg-123abctest' ],
        InstanceType: 't2.micro'
      };

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      //Act
      let result = autoScalingClientService._isLaunchConfigurationOutOfDate(launchConfigurationConfig, foundLaunchConfiguration);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if securityGroupId is not in the list of security groups', () => {
      //Arrange
      const launchConfigurationConfig = {
        name: 'LCName',
        baseImageId: 'ami-abc123test',
        securityGroupId: 'sg-123abctest',
        instanceType: 't2.micro'
      };

      const foundLaunchConfiguration = {
        name: 'LCName',
        ImageId: 'ami-abc123test',
        SecurityGroups: [],
        InstanceType: 't2.micro'
      };

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      //Act
      let result = autoScalingClientService._isLaunchConfigurationOutOfDate(launchConfigurationConfig, foundLaunchConfiguration);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if instanceType !== foundLaunchConfiguration.InstanceType', () => {
      //Arrange
      const launchConfigurationConfig = {
        name: 'LCName',
        baseImageId: 'ami-abc123test',
        securityGroupId: 'sg-123abctest',
        instanceType: 't2.micro'
      };

      const foundLaunchConfiguration = {
        name: 'LCName',
        ImageId: 'ami-abc123test',
        SecurityGroups: [ 'sg-123abctest' ],
        InstanceType: 't2.nano'
      };

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      //Act
      let result = autoScalingClientService._isLaunchConfigurationOutOfDate(launchConfigurationConfig, foundLaunchConfiguration);

      //Assert
      expect(result).to.be.true;
    });
  });


  describe('_newLaunchConfigurationName', () => {
    it('should take a boring old name with no versioning and add in " - v1""', () => {
      //Arrange
      const oldLaunchConfigurationName = '***REMOVED*** ECS LC - Dev';


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      //Act
      let result = autoScalingClientService._newLaunchConfigurationName(oldLaunchConfigurationName);

      //Assert
      expect(result).to.contain(' - v');
    });

    it('should take a name with versioning and increment it', () => {
      //Arrange
      const oldLaunchConfigurationName = '***REMOVED*** ECS LC - Dev - v12345';


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      //Act
      let result = autoScalingClientService._newLaunchConfigurationName(oldLaunchConfigurationName);

      //Assert
      expect(result).to.contain(' - v12346');
    });
  });


  describe('_createOrUpdateLaunchConfiguration', () => {
    it('should pass name to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = 'Test Cluster';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.property('LaunchConfigurationName', name);
      });
    });

    it('should pass imageId to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = 'Test Cluster';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.property('ImageId', imageId);
      });
    });

    it('should pass securityGroupId to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = 'Test Cluster';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.property('SecurityGroups');
        expect(params.SecurityGroups).to.be.deep.equal([securityGroupId]);
      });
    });

    it('should pass instanceType to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = 'Test Cluster';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.property('InstanceType', instanceType);
      });
    });

    it('should pass sshKeyName when available to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = 'keyName';
      const ecsClusterName = 'Test Cluster';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.property('KeyName', sshKeyName);
      });
    });

    it('should NOT pass sshKeyName when null to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = 'Test Cluster';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.not.have.property('KeyName');
      });
    });

    it('should pass UserData script when ecsClusterName is available to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = 'Test Cluster';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        let based64EncodedScript = base64.encode(`#!/bin/bash\necho ECS_CLUSTER=${ecsClusterName} >> /etc/ecs/ecs.config`);

        expect(params).to.have.property('UserData', based64EncodedScript);
      });
    });

    it('should NOT pass UserData script when ecsClusterName is null to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = '';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.not.have.property('UserData');
      });
    });

    it('should pass AssociatePublicIpAddress=true to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = '';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.property('AssociatePublicIpAddress', true);
      });
    });

    it('should pass EbsOptimized=false to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = '';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.property('EbsOptimized', false);
      });
    });

    it('should pass InstanceMonitoring.Enabled=false to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = '';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.deep.property('InstanceMonitoring.Enabled', false);
      });
    });

    it('should pass BlockDeviceMappings=[] to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = '';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.property('BlockDeviceMappings');
        expect(params.BlockDeviceMappings).to.be.deep.equal([]);
      });
    });

    it('should pass PlacementTenancy=default to createLaunchConfiguration method', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = '';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createLaunchConfiguration.args[0][0];

        expect(params).to.have.property('PlacementTenancy', 'default');
      });
    });

    it('should call createLaunchConfiguration once', () => {
      //Arrange

      let createLaunchConfigurationResponse = { };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createLaunchConfiguration: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLaunchConfigurationResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const name = 'LCName';
      const imageId = 'ami-abc123test';
      const securityGroupId = 'sg-123abctest';
      const instanceType = 't2.micro';
      const sshKeyName = '';
      const ecsClusterName = '';


      //Act
      let resultPromise = autoScalingClientService._createOrUpdateLaunchConfiguration(name, imageId, securityGroupId, instanceType, sshKeyName, ecsClusterName);

      //Assert
      return resultPromise.then(() => {
        expect(awsAutoScalingClientMock.createLaunchConfiguration.callCount).to.be.equal(1);
      });
    });
  });


  describe('createOrUpdateAutoScalingGroup', () => {
    it('should pass params to getAutoScalingGroup method', () => {
      //Arrange

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = 'targetGroupArn';
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      let params = {
        environment,
        name: autoScalingGroupName,
        launchConfigurationName,
        minSize,
        maxSize,
        desiredCapacity,
        targetGroupArns,
        vpcSubnets
      };

      let launchConfigToDeleteName = '';

      //Act
      let resultPromise = autoScalingClientService.createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService.getAutoScalingGroup.args[0][0]).to.be.equal(autoScalingGroupName);
      });
    });

    it('should not call _createAutoScalingGroup if autoScaleGroup already exists', () => {
      //Arrange

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = 'targetGroupArn';
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      let params = {
        environment,
        autoScalingGroupName,
        launchConfigurationName,
        minSize,
        maxSize,
        desiredCapacity,
        targetGroupArns,
        vpcSubnets
      };

      let launchConfigToDeleteName = '';

      let expectedParams = autoScalingClientService._generateAutoScalingParams(params);

      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves(expectedParams);

      //Act
      let resultPromise = autoScalingClientService.createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._createAutoScalingGroup.callCount).to.be.equal(0);
      });
    });

    it('should call _createAutoScalingGroup once if autoScaleGroup doesnt exist', () => {
      //Arrange

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = 'targetGroupArn';
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      let params = {
        environment,
        autoScalingGroupName,
        launchConfigurationName,
        minSize,
        maxSize,
        desiredCapacity,
        targetGroupArns,
        vpcSubnets
      };

      let launchConfigToDeleteName = '';

      //Act
      let resultPromise = autoScalingClientService.createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._createAutoScalingGroup.callCount).to.be.equal(1);
      });
    });

    it('should pass parameters to _createAutoScalingGroup', () => {
      //Arrange

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves('');
      autoScalingClientService._createAutoScalingGroup = sandbox.stub().resolves({});

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = 'targetGroupArn';
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      let params = {
        environment,
        autoScalingGroupName,
        launchConfigurationName,
        minSize,
        maxSize,
        desiredCapacity,
        targetGroupArns,
        vpcSubnets
      };

      let launchConfigToDeleteName = '';

      let expectedParams = autoScalingClientService._generateAutoScalingParams(params);

      //Act
      let resultPromise = autoScalingClientService.createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._createAutoScalingGroup.args[0][0]).to.be.equal(environment);
        expect(autoScalingClientService._createAutoScalingGroup.args[0][1]).to.be.equal(expectedParams.name);
        expect(autoScalingClientService._createAutoScalingGroup.args[0][2]).to.be.equal(launchConfigurationName);
        expect(autoScalingClientService._createAutoScalingGroup.args[0][3]).to.be.equal(minSize);
        expect(autoScalingClientService._createAutoScalingGroup.args[0][4]).to.be.equal(maxSize);
        expect(autoScalingClientService._createAutoScalingGroup.args[0][5]).to.be.equal(desiredCapacity);
        expect(autoScalingClientService._createAutoScalingGroup.args[0][6]).to.be.equal(targetGroupArns);
        expect(autoScalingClientService._createAutoScalingGroup.args[0][7]).to.be.deep.equal(vpcSubnets);
      });
    });

    it('should call _updateAutoScalingGroup if autoScaleGroup already exists but is out of date', () => {
      //Arrange

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService._updateAutoScalingGroup = sandbox.stub().resolves({});
      autoScalingClientService._isAutoScalingGroupOutOfDate = sandbox.stub().returns(true);

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = 'targetGroupArn';
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      let params = {
        environment,
        autoScalingGroupName,
        launchConfigurationName,
        minSize,
        maxSize,
        desiredCapacity,
        targetGroupArns,
        vpcSubnets
      };

      let launchConfigToDeleteName = '';

      let expectedParams = autoScalingClientService._generateAutoScalingParams(params);

      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves(expectedParams);

      //Act
      let resultPromise = autoScalingClientService.createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._updateAutoScalingGroup.callCount).to.be.equal(1);
      });
    });

    it('should not call _updateAutoScalingGroup if autoScaleGroup already exists and is up to date', () => {
      //Arrange

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService._updateAutoScalingGroup = sandbox.stub().resolves({});
      autoScalingClientService._isAutoScalingGroupOutOfDate = sandbox.stub().returns(false);

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = 'targetGroupArn';
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      let params = {
        environment,
        autoScalingGroupName,
        launchConfigurationName,
        minSize,
        maxSize,
        desiredCapacity,
        targetGroupArns,
        vpcSubnets
      };

      let launchConfigToDeleteName = '';

      let expectedParams = autoScalingClientService._generateAutoScalingParams(params);

      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves(expectedParams);

      //Act
      let resultPromise = autoScalingClientService.createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._updateAutoScalingGroup.callCount).to.be.equal(0);
      });
    });

    it('should pass parameters to _updateAutoScalingGroup', () => {
      //Arrange

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService._updateAutoScalingGroup = sandbox.stub().resolves({});
      autoScalingClientService._isAutoScalingGroupOutOfDate = sandbox.stub().returns(true);

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = 'targetGroupArn';
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      let params = {
        environment,
        autoScalingGroupName,
        launchConfigurationName,
        minSize,
        maxSize,
        desiredCapacity,
        targetGroupArns,
        vpcSubnets
      };

      let launchConfigToDeleteName = '';

      let expectedParams = autoScalingClientService._generateAutoScalingParams(params);

      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves(expectedParams);

      //Act
      let resultPromise = autoScalingClientService.createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService._updateAutoScalingGroup.callCount).to.be.equal(1);
        expect(autoScalingClientService._updateAutoScalingGroup.args[0][0]).to.be.equal(environment);
        expect(autoScalingClientService._updateAutoScalingGroup.args[0][1]).to.be.equal(expectedParams.name);
        expect(autoScalingClientService._updateAutoScalingGroup.args[0][2]).to.be.equal(launchConfigurationName);
        expect(autoScalingClientService._updateAutoScalingGroup.args[0][3]).to.be.equal(minSize);
        expect(autoScalingClientService._updateAutoScalingGroup.args[0][4]).to.be.equal(maxSize);
        expect(autoScalingClientService._updateAutoScalingGroup.args[0][5]).to.be.equal(desiredCapacity);
        expect(autoScalingClientService._updateAutoScalingGroup.args[0][6]).to.be.equal(targetGroupArns);
        expect(autoScalingClientService._updateAutoScalingGroup.args[0][7]).to.be.equal(vpcSubnets);
      });
    });

    it('should call deleteLaunchConfiguration if launchConfigToDeleteName is set', () => {
      //Arrange

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService._updateAutoScalingGroup = sandbox.stub().resolves({});
      autoScalingClientService.deleteLaunchConfiguration = sandbox.stub().resolves({});
      autoScalingClientService._isAutoScalingGroupOutOfDate = sandbox.stub().returns(true);

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = 'targetGroupArn';
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      let params = {
        environment,
        autoScalingGroupName,
        launchConfigurationName,
        minSize,
        maxSize,
        desiredCapacity,
        targetGroupArns,
        vpcSubnets
      };

      let launchConfigToDeleteName = 'blah';

      let expectedParams = autoScalingClientService._generateAutoScalingParams(params);

      autoScalingClientService.getAutoScalingGroup = sandbox.stub().resolves(expectedParams);

      //Act
      let resultPromise = autoScalingClientService.createOrUpdateAutoScalingGroup(params, launchConfigToDeleteName);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService.deleteLaunchConfiguration.callCount).to.be.equal(1);
      });
    });

  });


  describe('_isAutoScalingGroupOutOfDate', () => {
    it('should return false if everything is the same', () => {
      //Arrange
      const autoScalingParams = {
        environment: 'hi',
        name: 'yes',
        launchConfigurationName: 'yes',
        maxSize: 3,
        minSize: 2,
        desiredCapacity: 2,
        targetGroupArns: 'yes',
        vpcSubnets: 'hello'
      };

      const foundAutoScalingGroup = {
        AutoScalingGroupName: 'yes',
        MaxSize: 3,
        MinSize: 2,
        DefaultCooldown: 300,
        DesiredCapacity: 2,
        HealthCheckGracePeriod: 0,
        LaunchConfigurationName: 'yes',
        NewInstancesProtectedFromScaleIn: false,
        VPCZoneIdentifier: 'hello'
      };


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._isAutoScalingGroupOutOfDate(autoScalingParams, foundAutoScalingGroup);

      //Assert
      expect(result).to.be.false;
    });

    it('should return true if AutoScalingGroupNames dont match', () => {
      //Arrange
      const autoScalingParams = {
        environment: 'hi',
        name: 'yes',
        launchConfigurationName: 'yes',
        maxSize: 3,
        minSize: 2,
        desiredCapacity: 2,
        targetGroupArns: 'yes',
        vpcSubnets: 'hello'
      };

      const foundAutoScalingGroup = {
        AutoScalingGroupName: 'no',
        MaxSize: 3,
        MinSize: 2,
        DefaultCooldown: 300,
        DesiredCapacity: 2,
        HealthCheckGracePeriod: 0,
        LaunchConfigurationName: 'yes',
        NewInstancesProtectedFromScaleIn: false,
        VPCZoneIdentifier: 'hello'
      };


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._isAutoScalingGroupOutOfDate(autoScalingParams, foundAutoScalingGroup);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if MaxSizes dont match', () => {
      //Arrange
      const autoScalingParams = {
        environment: 'hi',
        name: 'yes',
        launchConfigurationName: 'yes',
        maxSize: 3,
        minSize: 2,
        desiredCapacity: 2,
        targetGroupArns: 'yes',
        vpcSubnets: 'hello'
      };

      const foundAutoScalingGroup = {
        AutoScalingGroupName: 'yes',
        MaxSize: 4,
        MinSize: 2,
        DefaultCooldown: 300,
        DesiredCapacity: 2,
        HealthCheckGracePeriod: 0,
        LaunchConfigurationName: 'yes',
        NewInstancesProtectedFromScaleIn: false,
        VPCZoneIdentifier: 'hello'
      };


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._isAutoScalingGroupOutOfDate(autoScalingParams, foundAutoScalingGroup);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if MinSizes dont match', () => {
      //Arrange
      const autoScalingParams = {
        environment: 'hi',
        name: 'yes',
        launchConfigurationName: 'yes',
        maxSize: 3,
        minSize: 2,
        desiredCapacity: 2,
        targetGroupArns: 'yes',
        vpcSubnets: 'hello'
      };

      const foundAutoScalingGroup = {
        AutoScalingGroupName: 'yes',
        MaxSize: 3,
        MinSize: 1,
        DefaultCooldown: 300,
        DesiredCapacity: 2,
        HealthCheckGracePeriod: 0,
        LaunchConfigurationName: 'yes',
        NewInstancesProtectedFromScaleIn: false,
        VPCZoneIdentifier: 'hello'
      };


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._isAutoScalingGroupOutOfDate(autoScalingParams, foundAutoScalingGroup);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if DesiredCapacity params dont match', () => {
      //Arrange
      const autoScalingParams = {
        environment: 'hi',
        name: 'yes',
        launchConfigurationName: 'yes',
        maxSize: 3,
        minSize: 2,
        desiredCapacity: 2,
        targetGroupArns: 'yes',
        vpcSubnets: 'hello'
      };

      const foundAutoScalingGroup = {
        AutoScalingGroupName: 'yes',
        MaxSize: 3,
        MinSize: 2,
        DefaultCooldown: 300,
        DesiredCapacity: 3,
        HealthCheckGracePeriod: 0,
        LaunchConfigurationName: 'yes',
        NewInstancesProtectedFromScaleIn: false,
        VPCZoneIdentifier: 'hello'
      };


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._isAutoScalingGroupOutOfDate(autoScalingParams, foundAutoScalingGroup);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if LaunchConfigurationNames dont match', () => {
      //Arrange
      const autoScalingParams = {
        environment: 'hi',
        name: 'yes',
        launchConfigurationName: 'yes',
        maxSize: 3,
        minSize: 2,
        desiredCapacity: 2,
        targetGroupArns: 'yes',
        vpcSubnets: 'hello'
      };

      const foundAutoScalingGroup = {
        AutoScalingGroupName: 'yes',
        MaxSize: 3,
        MinSize: 2,
        DefaultCooldown: 300,
        DesiredCapacity: 2,
        HealthCheckGracePeriod: 0,
        LaunchConfigurationName: 'no',
        NewInstancesProtectedFromScaleIn: false,
        VPCZoneIdentifier: 'hello'
      };


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._isAutoScalingGroupOutOfDate(autoScalingParams, foundAutoScalingGroup);

      //Assert
      expect(result).to.be.true;
    });

    it('should return true if VPCZoneIdentifiers dont match', () => {
      //Arrange
      const autoScalingParams = {
        environment: 'hi',
        name: 'yes',
        launchConfigurationName: 'yes',
        maxSize: 3,
        minSize: 2,
        desiredCapacity: 2,
        targetGroupArns: 'yes',
        vpcSubnets: 'hello'
      };

      const foundAutoScalingGroup = {
        AutoScalingGroupName: 'yes',
        MaxSize: 3,
        MinSize: 2,
        DefaultCooldown: 300,
        DesiredCapacity: 2,
        HealthCheckGracePeriod: 0,
        LaunchConfigurationName: 'yes',
        NewInstancesProtectedFromScaleIn: false,
        VPCZoneIdentifier: 'nothello'
      };


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._isAutoScalingGroupOutOfDate(autoScalingParams, foundAutoScalingGroup);

      //Assert
      expect(result).to.be.true;
    });

  });


  describe('_generateAutoScalingParams', () => {
    it('should return various mutations if isCreate=false', () => {
      //Arrange
      const autoScalingParams = {
        environment: 'hi',
        name: 'yes',
        launchConfigurationName: 'yes',
        maxSize: 3,
        minSize: 2,
        desiredCapacity: 2,
        targetGroupArns: 'yes',
        vpcSubnets: 'hello'
      };

      const expectedResult = {
        AutoScalingGroupName: 'yes',
        MaxSize: 3,
        MinSize: 2,
        DefaultCooldown: 300,
        DesiredCapacity: 2,
        HealthCheckGracePeriod: 0,
        LaunchConfigurationName: 'yes',
        NewInstancesProtectedFromScaleIn: false,
        VPCZoneIdentifier: 'hello'
      };


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._generateAutoScalingParams(autoScalingParams, false);

      //Assert
      expect(result).to.be.deep.equal(expectedResult);
    });

    it('should return various other mutations if isCreate=true', () => {
      //Arrange
      const autoScalingParams = {
        environment: 'hi',
        name: 'yes',
        launchConfigurationName: 'yes',
        maxSize: 3,
        minSize: 2,
        desiredCapacity: 2,
        targetGroupArns: 'yes',
        vpcSubnets: 'hello'
      };

      const expectedResult = {
        AutoScalingGroupName: 'yes',
        MaxSize: 3,
        MinSize: 2,
        DefaultCooldown: 300,
        DesiredCapacity: 2,
        HealthCheckGracePeriod: 0,
        LaunchConfigurationName: 'yes',
        NewInstancesProtectedFromScaleIn: false,
        VPCZoneIdentifier: 'hello',
        TargetGroupARNs: ['yes'],
        Tags: [
          {
            Key: 'Name',
            PropagateAtLaunch: true,
            ResourceType: 'auto-scaling-group',
            Value: `${autoScalingParams.environment} - ECS Instance`
          },
          {
            Key: 'Environment',
            PropagateAtLaunch: true,
            ResourceType: 'auto-scaling-group',
            Value: autoScalingParams.environment
          },
          {
            Key: 'Created',
            PropagateAtLaunch: true,
            ResourceType: 'auto-scaling-group',
            Value: moment().format()
          }
        ]
      };


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._generateAutoScalingParams(autoScalingParams, true);

      //Assert
      expect(result).to.be.deep.equal(expectedResult);
    });

  });


  describe('_createAutoScalingGroup', () => {
    it('should convert targetGroupArns from single string to array', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = 'targetGroupArn';
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('TargetGroupARNs');
        expect(params.TargetGroupARNs).to.be.array;
        expect(params.TargetGroupARNs).to.be.deep.equal([targetGroupArns]);

      });
    });

    it('should pass environment parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('Tags');
        let environmentTag = __.filter(params.Tags, {Key: 'Environment'});
        expect(environmentTag[0]).to.have.property('PropagateAtLaunch', true);
        expect(environmentTag[0]).to.have.property('ResourceType', 'auto-scaling-group');
        expect(environmentTag[0]).to.have.property('Value', environment);

        let nameTag = __.filter(params.Tags, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('PropagateAtLaunch', true);
        expect(nameTag[0]).to.have.property('ResourceType', 'auto-scaling-group');
        expect(nameTag[0]).to.have.property('Value', `${environment} - ECS Instance`);

      });
    });

    it('should pass name parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('AutoScalingGroupName', autoScalingGroupName);

      });
    });

    it('should pass launchConfigurationName parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('LaunchConfigurationName', launchConfigurationName);

      });
    });

    it('should pass minSize parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('MinSize', minSize);

      });
    });

    it('should pass maxSize parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('MaxSize', maxSize);

      });
    });

    it('should pass desiredCapacity parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('DesiredCapacity', desiredCapacity);

      });
    });

    it('should pass targetGroupArns parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('TargetGroupARNs');
        expect(params.TargetGroupARNs).to.be.array;
        expect(params.TargetGroupARNs).to.be.deep.equal(targetGroupArns);

      });
    });

    it('should pass vpcSubnets parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('VPCZoneIdentifier');
        expect(params.VPCZoneIdentifier).to.be.array;
        expect(params.VPCZoneIdentifier).to.be.deep.equal(vpcSubnets);

      });
    });

    it('should pass DefaultCooldown=300 parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('DefaultCooldown', 300);

      });
    });

    it('should pass HealthCheckGracePeriod=0 parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('HealthCheckGracePeriod', 0);

      });
    });

    it('should pass NewInstancesProtectedFromScaleIn=false parameter to createOrUpdateAutoScalingGroup method', () => {
      //Arrange

      let createOrUpdateAutoScalingGroupResponse = {};

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        createAutoScalingGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createOrUpdateAutoScalingGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();

      const environment = 'testEnvironment';
      const autoScalingGroupName = 'asgName';
      const launchConfigurationName = 'lcName';
      const minSize = 1;
      const maxSize = 3;
      const desiredCapacity = 2;
      const targetGroupArns = ['targetGroupArn'];
      const vpcSubnets = ['subnet-123abc', 'subnet-456def'];

      //Act
      let resultPromise = autoScalingClientService._createAutoScalingGroup(environment, autoScalingGroupName, launchConfigurationName, minSize, maxSize, desiredCapacity, targetGroupArns, vpcSubnets);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.createAutoScalingGroup.args[0][0];

        expect(params).to.have.property('NewInstancesProtectedFromScaleIn', false);

      });
    });
  });


  describe('getLaunchConfiguration', () => {
    it('should pass nothing to describeLaunchConfigurations method', () => {
      //Arrange
      const launchConfigurationName = 'LCName';

      let describeLaunchConfigurationsResponse = {
        LaunchConfigurations: [
          {
            LaunchConfigurationName: 'LCName',
            LaunchConfigurationARN: 'arn:aws:autoscaling:us-west-2:***REMOVED***:launchConfiguration:166f9840-acd1-4cdf-9dce-415468284685:launchConfigurationName/***REMOVED*** ECS LC'
          }
        ]
      };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        describeLaunchConfigurations: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeLaunchConfigurationsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let resultPromise = autoScalingClientService.getLaunchConfiguration(launchConfigurationName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.describeLaunchConfigurations.args[0][0];

        expect(params).to.deep.equal({});
      });
    });

    it('should return launchConfiguration from result', () => {
      //Arrange
      const launchConfigurationName = 'LCName';

      let describeLaunchConfigurationsResponse = {
        LaunchConfigurations: [
          {
            LaunchConfigurationName: 'LCName',
            LaunchConfigurationARN: 'arn:aws:autoscaling:us-west-2:***REMOVED***:launchConfiguration:166f9840-acd1-4cdf-9dce-415468284685:launchConfigurationName/***REMOVED*** ECS LC'
          }
        ]
      };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        describeLaunchConfigurations: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeLaunchConfigurationsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let resultPromise = autoScalingClientService.getLaunchConfiguration(launchConfigurationName);

      //Assert
      return resultPromise.then(foundLaunchConfigurationArn => {
        expect(foundLaunchConfigurationArn).to.be.equal(describeLaunchConfigurationsResponse.LaunchConfigurations[0]);
      });
    });

    it('should return empty string when no matching launchConfiguration found', () => {
      //Arrange
      const launchConfigurationName = 'LCName';

      let describeLaunchConfigurationsResponse = {
        LaunchConfigurations: [ ]
      };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        describeLaunchConfigurations: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeLaunchConfigurationsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let resultPromise = autoScalingClientService.getLaunchConfiguration(launchConfigurationName);

      //Assert
      return resultPromise.then(foundLaunchConfigurationArn => {
        expect(foundLaunchConfigurationArn).to.be.equal('');
      });
    });
  });


  describe('_getLatestLaunchConfig', () => {
    it('should return an empty string if no launch configurations exists', () => {
      //Arrange

      const LaunchConfigurations = [];

      const launchConfigurationName = 'yes';


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._getLatestLaunchConfig(LaunchConfigurations, launchConfigurationName);

      //Assert
      expect(result).to.be.equal('');
    });

    it('should return the last matching launch configuration there are multiple', () => {
      //Arrange

      const LaunchConfigurations = [
        {
          AutoScalingGroupName: 'yes',
          MaxSize: 3,
          MinSize: 2,
          DefaultCooldown: 300,
          DesiredCapacity: 2,
          HealthCheckGracePeriod: 0,
          LaunchConfigurationName: 'yes',
          NewInstancesProtectedFromScaleIn: false,
          VPCZoneIdentifier: 'hello'
        },
        {
          AutoScalingGroupName: 'yes',
          MaxSize: 3,
          MinSize: 2,
          DefaultCooldown: 300,
          DesiredCapacity: 2,
          HealthCheckGracePeriod: 0,
          LaunchConfigurationName: 'no',
          NewInstancesProtectedFromScaleIn: false,
          VPCZoneIdentifier: 'hello'
        },
        {
          AutoScalingGroupName: 'yes',
          MaxSize: 3,
          MinSize: 2,
          DefaultCooldown: 300,
          DesiredCapacity: 2,
          HealthCheckGracePeriod: 0,
          LaunchConfigurationName: 'yes',
          NewInstancesProtectedFromScaleIn: false,
          VPCZoneIdentifier: 'hello'
        }
      ];

      const launchConfigurationName = 'yes';


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._getLatestLaunchConfig(LaunchConfigurations, launchConfigurationName);

      //Assert
      expect(result).to.be.equal(LaunchConfigurations[2]);
    });

    it('should return the only matching launch configuration there is just one', () => {
      //Arrange

      const LaunchConfigurations = [
        {
          AutoScalingGroupName: 'yes',
          MaxSize: 3,
          MinSize: 2,
          DefaultCooldown: 300,
          DesiredCapacity: 2,
          HealthCheckGracePeriod: 0,
          LaunchConfigurationName: 'yes',
          NewInstancesProtectedFromScaleIn: false,
          VPCZoneIdentifier: 'hello'
        }
      ];

      const launchConfigurationName = 'yes';


      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let result = autoScalingClientService._getLatestLaunchConfig(LaunchConfigurations, launchConfigurationName);

      //Assert
      expect(result).to.be.equal(LaunchConfigurations[0]);
    });
  });


  describe('deleteLaunchConfiguration', () => {
    it('should pass name to deleteLaunchConfiguration method', () => {
      //Arrange

      const launchConfigurationName = 'LCName';

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();
      autoScalingClientService.deleteLaunchConfiguration = sandbox.stub().resolves('');

      //Act
      let resultPromise = autoScalingClientService.deleteLaunchConfiguration(launchConfigurationName);

      //Assert
      return resultPromise.then(() => {
        expect(autoScalingClientService.deleteLaunchConfiguration.args[0][0]).to.be.equal(launchConfigurationName);
      });
    });

  });


  describe('getAutoScalingGroup', () => {
    it('should pass autoScalingGroupName to describeAutoScalingGroups method', () => {
      //Arrange
      const autoScalingGroupName = 'asgName';

      let describeAutoScalingGroupsResponse = {
        AutoScalingGroups: [
          {
            AutoScalingGroupARN: 'arn:aws:autoscaling:us-west-2:***REMOVED***:autoScalingGroup:c2c3fe59-962b-497d-bbfa-bbf556e68ab4:autoScalingGroupName/***REMOVED***-ECS-ASG'
          }
        ]
      };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        describeAutoScalingGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeAutoScalingGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let resultPromise = autoScalingClientService.getAutoScalingGroup(autoScalingGroupName);

      //Assert
      return resultPromise.then(() => {
        let params = awsAutoScalingClientMock.describeAutoScalingGroups.args[0][0];

        expect(params).to.have.property('AutoScalingGroupNames');
        expect(params.AutoScalingGroupNames[0]).to.have.equal(autoScalingGroupName);
      });
    });

    it('should return autoScalingGroup from result', () => {
      //Arrange
      const autoScalingGroupName = 'asgName';

      let describeAutoScalingGroupsResponse = {
        AutoScalingGroups: [
          {
            AutoScalingGroupARN: 'arn:aws:autoscaling:us-west-2:***REMOVED***:autoScalingGroup:c2c3fe59-962b-497d-bbfa-bbf556e68ab4:autoScalingGroupName/***REMOVED***-ECS-ASG'
          }
        ]
      };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        describeAutoScalingGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeAutoScalingGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let resultPromise = autoScalingClientService.getAutoScalingGroup(autoScalingGroupName);

      //Assert
      return resultPromise.then(foundAutoScalingGroupARN => {
        expect(foundAutoScalingGroupARN).to.be.equal(describeAutoScalingGroupsResponse.AutoScalingGroups[0]);
      });
    });

    it('should return empty string if no matching autoScalingGroups', () => {
      //Arrange
      const autoScalingGroupName = 'asgName';

      let describeAutoScalingGroupsResponse = {
        AutoScalingGroups: [ ]
      };

      //setting up autoScalingClient Mock
      let awsAutoScalingClientMock = {
        describeAutoScalingGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeAutoScalingGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        AutoScaling: () => {
          return awsAutoScalingClientMock;
        }
      });

      //Setting up AutoScaling clients
      const AutoScaling = require('../src/autoScalingClient');
      const autoScalingClientService = new AutoScaling();


      //Act
      let resultPromise = autoScalingClientService.getAutoScalingGroup(autoScalingGroupName);

      //Assert
      return resultPromise.then(foundAutoScalingGroupARN => {
        expect(foundAutoScalingGroupARN).to.be.equal('');
      });
    });
  });


});
