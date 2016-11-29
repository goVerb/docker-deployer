const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const mockery = require('mockery');
const __ = require('lodash');
const BluebirdPromise = require('bluebird');


require('sinon-as-promised');
chai.use(chaiAsPromised);




describe('ELB Client', function() {
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

  describe('createApplicationLoadBalancer', () => {
    it('should pass name to getApplicationLoadBalancerArnFromName method', () => {
      //Arrange
      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getApplicationLoadBalancerArnFromName = sandbox.stub().resolves('');
      elbClientService._createApplicationLoadBalancer = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService.getApplicationLoadBalancerArnFromName.args[0][0]).to.be.equal(name);
      });
    });

    it('should not call _createApplicationLoadBalancer if applicationLoadBalancer already exists', () => {
      //Arrange
      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getApplicationLoadBalancerArnFromName = sandbox.stub().resolves('existingAppLoadBalancerArn');
      elbClientService._createApplicationLoadBalancer = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createApplicationLoadBalancer.callCount).to.be.equal(0);
      });
    });

    it('should pass parameters to _createApplicationLoadBalancer', () => {
      //Arrange
      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getApplicationLoadBalancerArnFromName = sandbox.stub().resolves('');
      elbClientService._createApplicationLoadBalancer = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createApplicationLoadBalancer.args[0][0]).to.be.equal(environment);
        expect(elbClientService._createApplicationLoadBalancer.args[0][1]).to.be.equal(name);
        expect(elbClientService._createApplicationLoadBalancer.args[0][2]).to.be.deep.equal(subnetIds);
        expect(elbClientService._createApplicationLoadBalancer.args[0][3]).to.be.equal(scheme);
        expect(elbClientService._createApplicationLoadBalancer.args[0][4]).to.be.deep.equal(securityGroupIds);
      });
    });

    it('should call _createApplicationLoadBalancer once if ApplicationLoadBalancer doesnt exist', () => {
      //Arrange
      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getApplicationLoadBalancerArnFromName = sandbox.stub().resolves('');
      elbClientService._createApplicationLoadBalancer = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createApplicationLoadBalancer.callCount).to.be.equal(1);
      });
    });
  });

  describe('_createApplicationLoadBalancer', () => {
    it('should pass appElbName to createLoadBalancer method', () => {
      //Arrange
      let createLoadBalancerResponse = {
        LoadBalancers: [
          {
            LoadBalancerArn: 'createdLoadbalancerArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createLoadBalancer: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLoadBalancerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createLoadBalancer.args[0][0];

        expect(params).to.have.property('Name', name);
      });
    });

    it('should pass subnetIds to createLoadBalancer method', () => {
      //Arrange
      let createLoadBalancerResponse = {
        LoadBalancers: [
          {
            LoadBalancerArn: 'createdLoadbalancerArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createLoadBalancer: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLoadBalancerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createLoadBalancer.args[0][0];

        expect(params).to.have.property('Subnets');
        expect(params.Subnets).to.be.deep.equal(subnetIds);
      });
    });

    it('should pass scheme to createLoadBalancer method', () => {
      //Arrange
      let createLoadBalancerResponse = {
        LoadBalancers: [
          {
            LoadBalancerArn: 'createdLoadbalancerArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createLoadBalancer: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLoadBalancerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createLoadBalancer.args[0][0];

        expect(params).to.have.property('Scheme', scheme);
      });
    });

    it('should pass securityGroupIds to createLoadBalancer method', () => {
      //Arrange
      let createLoadBalancerResponse = {
        LoadBalancers: [
          {
            LoadBalancerArn: 'createdLoadbalancerArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createLoadBalancer: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLoadBalancerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createLoadBalancer.args[0][0];

        expect(params).to.have.property('SecurityGroups');
        expect(params.SecurityGroups).to.be.deep.equal(securityGroupIds);
      });
    });

    it('should pass environment to createLoadBalancer method', () => {
      //Arrange
      let createLoadBalancerResponse = {
        LoadBalancers: [
          {
            LoadBalancerArn: 'createdLoadbalancerArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createLoadBalancer: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLoadBalancerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createLoadBalancer.args[0][0];

        expect(params).to.have.property('Tags');

        let environmentTag = __.filter(params.Tags, {Key: 'Environment'});
        expect(environmentTag[0]).to.have.property('Value', environment);
      });
    });

    it('should pass Created=(currentTime) to createLoadBalancer method', () => {
      //Arrange
      let createLoadBalancerResponse = {
        LoadBalancers: [
          {
            LoadBalancerArn: 'createdLoadbalancerArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createLoadBalancer: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLoadBalancerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createLoadBalancer.args[0][0];

        expect(params).to.have.property('Tags');

        let environmentTag = __.filter(params.Tags, {Key: 'Created'});
        expect(environmentTag[0].Value).to.match(/.*T.*/);
      });
    });

    it('should return loadBalancerArn when created', () => {
      //Arrange
      let createLoadBalancerResponse = {
        LoadBalancers: [
          {
            LoadBalancerArn: 'createdLoadbalancerArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createLoadBalancer: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLoadBalancerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(createdLoadBalancerArn => {
        expect(createdLoadBalancerArn).to.be.equal(createLoadBalancerResponse.LoadBalancers[0].LoadBalancerArn);
      });
    });

    it('should return empty string if response is null', () => {
      //Arrange
      let createLoadBalancerResponse = {};

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createLoadBalancer: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createLoadBalancerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'uniqueAppElbName';
      const subnetIds = ['subnet-123abc', 'subnet-456def'];
      const scheme = 'internet-facing';
      const securityGroupIds = ['sg-123abc'];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createApplicationLoadBalancer(environment, name, subnetIds, scheme, securityGroupIds);

      //Assert
      return resultPromise.then(createdLoadBalancerArn => {
        expect(createdLoadBalancerArn).to.be.equal('');
      });
    });
  });

  describe('createTargetGroup', () => {
    it('should pass name to getTargetGroupArnFromName method', () => {
      //Arrange
      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'abc';
      const healthCheckSettingOverrides = {};

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getTargetGroupArnFromName = sandbox.stub().resolves('');
      elbClientService._createTargetGroup = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService.getTargetGroupArnFromName.args[0][0]).to.be.equal(name);
      });
    });

    it('should not call _createTargetGroup if targetGroup already exist', () => {
      //Arrange
      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'abc';
      const healthCheckSettingOverrides = {};

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getTargetGroupArnFromName = sandbox.stub().resolves('targetGroupArn');
      elbClientService._createTargetGroup = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createTargetGroup.callCount).to.be.equal(0);
      });
    });

    it('should pass parameters to _createTargetGroup method', () => {
      //Arrange
      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'abc';
      const healthCheckSettingOverrides = {};

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getTargetGroupArnFromName = sandbox.stub().resolves('');
      elbClientService._createTargetGroup = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createTargetGroup.args[0][0]).to.be.equal(environment);
        expect(elbClientService._createTargetGroup.args[0][1]).to.be.equal(name);
        expect(elbClientService._createTargetGroup.args[0][2]).to.be.equal(port);
        expect(elbClientService._createTargetGroup.args[0][3]).to.be.equal(protocol);
        expect(elbClientService._createTargetGroup.args[0][4]).to.be.equal(vpcId);
        expect(elbClientService._createTargetGroup.args[0][5]).to.be.deep.equal(healthCheckSettingOverrides);
      });
    });

    it('should call _createTargetGroup once if targetGroup doesnt exist', () => {
      //Arrange
      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'abc';
      const healthCheckSettingOverrides = {};

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getTargetGroupArnFromName = sandbox.stub().resolves('');
      elbClientService._createTargetGroup = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createTargetGroup.callCount).to.be.equal(1);
      });
    });
  });

  describe('_createTargetGroup', () => {
    it('should throw error if protocol is not HTTP or HTTPS', () => {
      //Arrange
      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'abc';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.catch(err => {
        expect(err.message).to.be.equal(`Invalid protocol parameter value.  Value must be HTTP or HTTPs.  [Value: ${protocol}]`)
      });
    });

    it('should pass name to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('Name', name);
      });
    });

    it('should pass port to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('Port', port);
      });
    });

    it('should pass protocol to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('Protocol', protocol);
      });
    });

    it('should pass vpcId to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('VpcId', vpcId);
      });
    });

    it('should pass healthCheckSettingOverrides.HealthCheckIntervalSeconds if provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {
        HealthCheckIntervalSeconds: 1
      };


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('HealthCheckIntervalSeconds', healthCheckSettingOverrides.HealthCheckIntervalSeconds);
      });
    });

    it('should NOT pass healthCheckSettingOverrides.HealthCheckIntervalSeconds if not provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.not.have.property('HealthCheckIntervalSeconds');
      });
    });

    it('should pass healthCheckSettingOverrides.HealthCheckPath if provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {
        HealthCheckPath: '/'
      };


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('HealthCheckPath', healthCheckSettingOverrides.HealthCheckPath);
      });
    });

    it('should NOT pass healthCheckSettingOverrides.HealthCheckPath if not provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.not.have.property('HealthCheckPath');
      });
    });

    it('should pass healthCheckSettingOverrides.HealthCheckPort if provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {
        HealthCheckPort: 80
      };


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('HealthCheckPort', healthCheckSettingOverrides.HealthCheckPort);
      });
    });

    it('should NOT pass healthCheckSettingOverrides.HealthCheckPort if not provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.not.have.property('HealthCheckPort');
      });
    });

    it('should pass healthCheckSettingOverrides.HealthCheckProtocol if provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {
        HealthCheckProtocol: 'HTTP'
      };


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('HealthCheckProtocol', healthCheckSettingOverrides.HealthCheckProtocol);
      });
    });

    it('should NOT pass healthCheckSettingOverrides.HealthCheckProtocol if not provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.not.have.property('HealthCheckProtocol');
      });
    });

    it('should pass healthCheckSettingOverrides.HealthCheckTimeoutSeconds if provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {
        HealthCheckTimeoutSeconds: 5
      };


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('HealthCheckTimeoutSeconds', healthCheckSettingOverrides.HealthCheckTimeoutSeconds);
      });
    });

    it('should NOT pass healthCheckSettingOverrides.HealthCheckTimeoutSeconds if not provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.not.have.property('HealthCheckTimeoutSeconds');
      });
    });

    it('should pass healthCheckSettingOverrides.HealthyThresholdCount if provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {
        HealthyThresholdCount: 2
      };


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('HealthyThresholdCount', healthCheckSettingOverrides.HealthyThresholdCount);
      });
    });

    it('should NOT pass healthCheckSettingOverrides.HealthyThresholdCount if not provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.not.have.property('HealthyThresholdCount');
      });
    });

    it('should pass healthCheckSettingOverrides.Matcher if provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {
        Matcher: {
          HttpCode: '200'
        }
      };


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('Matcher');
        expect(params.Matcher).to.have.deep.equal(healthCheckSettingOverrides.Matcher);
      });
    });

    it('should NOT pass healthCheckSettingOverrides.Matcher if not provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.not.have.property('Matcher');
      });
    });

    it('should pass healthCheckSettingOverrides.UnhealthyThresholdCount if provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {
        UnhealthyThresholdCount: 5
      };


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.have.property('UnhealthyThresholdCount', healthCheckSettingOverrides.UnhealthyThresholdCount);
      });
    });

    it('should NOT pass healthCheckSettingOverrides.UnhealthyThresholdCount if not provided to createTargetGroup method', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTargetGroup.args[0][0];

        expect(params).to.not.have.property('UnhealthyThresholdCount');
      });
    });

    it('should pass name and environment tags to _createTagsForTargetGroup', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createTagsForTargetGroup.args[0][0]).to.be.equal(createTargetGroupResponse.TargetGroups[0].TargetGroupArn);
        let tagsParam = elbClientService._createTagsForTargetGroup.args[0][1];

        let expectedTags = [
          { Key: 'Name', Value: name},
          { Key: 'Environment', Value: environment }
        ];

        expect(tagsParam).to.be.deep.equal(expectedTags);
      });
    });

    it('should call _createTagsForTargetGroup once', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createTagsForTargetGroup.callCount).to.be.equal(1);
      });
    });

    it('should return created targetGroupArn', () => {
      //Arrange
      let createTargetGroupResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'createdTargetGroupArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTargetGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTargetGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const environment = 'testENV';
      const name = 'targetGroupName';
      const vpcId = 'vpc-123test';
      const port = 80;
      const protocol = 'HTTP';
      const healthCheckSettingOverrides = {};


      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService._createTagsForTargetGroup = sandbox.stub().resolves({});


      //Act
      let resultPromise = elbClientService._createTargetGroup(environment, name, port, protocol, vpcId, healthCheckSettingOverrides);

      //Assert
      return resultPromise.then(createdTargetGroupArn => {
        expect(createdTargetGroupArn).to.be.equal(createTargetGroupResponse.TargetGroups[0].TargetGroupArn);
      });
    });
  });

  describe('createListener', () => {
    it('should pass loadBalancerArn, protocol, and port to getListenerArn', () => {
      //Arrange
      const applicationLoadBalancerArn = 'complicatedArn';
      const targetGroupArn = 'targetGroupArn';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getListenerArn = sandbox.stub().resolves('');
      elbClientService._createListener = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createListener(applicationLoadBalancerArn, targetGroupArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService.getListenerArn.args[0][0]).to.be.equal(applicationLoadBalancerArn);
        expect(elbClientService.getListenerArn.args[0][1]).to.be.equal(protocol);
        expect(elbClientService.getListenerArn.args[0][2]).to.be.equal(port);
      });
    });

    it('should not call _createListener if listener already exist', () => {
      //Arrange
      const applicationLoadBalancerArn = 'complicatedArn';
      const targetGroupArn = 'targetGroupArn';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getListenerArn = sandbox.stub().resolves('existingListenerArn');
      elbClientService._createListener = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createListener(applicationLoadBalancerArn, targetGroupArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createListener.callCount).to.be.equal(0);
      });
    });

    it('should pass parameters to _createListener', () => {
      //Arrange
      const applicationLoadBalancerArn = 'complicatedArn';
      const targetGroupArn = 'targetGroupArn';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getListenerArn = sandbox.stub().resolves('');
      elbClientService._createListener = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createListener(applicationLoadBalancerArn, targetGroupArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createListener.args[0][0]).to.be.equal(applicationLoadBalancerArn);
        expect(elbClientService._createListener.args[0][1]).to.be.equal(targetGroupArn);
        expect(elbClientService._createListener.args[0][2]).to.be.equal(protocol);
        expect(elbClientService._createListener.args[0][3]).to.be.equal(port);
      });
    });

    it('should call _createListener once if listener doesnt exist', () => {
      //Arrange
      const applicationLoadBalancerArn = 'complicatedArn';
      const targetGroupArn = 'targetGroupArn';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();
      elbClientService.getListenerArn = sandbox.stub().resolves('');
      elbClientService._createListener = sandbox.stub().resolves('');


      //Act
      let resultPromise = elbClientService.createListener(applicationLoadBalancerArn, targetGroupArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        expect(elbClientService._createListener.callCount).to.be.equal(1);
      });
    });
  });

  describe('_createListener', () => {
    it('should pass loadBalancerArn to createListener method', () => {
      //Arrange
      let createListenerResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createListener: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createListenerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const applicationLoadBalancerArn = 'complicatedArn';
      const targetGroupArn = 'targetGroupArn/::qierd-stuff/';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createListener(applicationLoadBalancerArn, targetGroupArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createListener.args[0][0];

        expect(params).to.have.property('LoadBalancerArn', applicationLoadBalancerArn);
      });
    });

    it('should pass targetGroupArn to createListener method', () => {
      //Arrange
      let createListenerResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createListener: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createListenerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const applicationLoadBalancerArn = 'complicatedArn';
      const targetGroupArn = 'targetGroupArn/::qierd-stuff/';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createListener(applicationLoadBalancerArn, targetGroupArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createListener.args[0][0];

        expect(params).to.have.deep.property('DefaultActions[0].TargetGroupArn', targetGroupArn);
        expect(params).to.have.deep.property('DefaultActions[0].Type', 'forward');
      });
    });

    it('should pass protocol to createListener method', () => {
      //Arrange
      let createListenerResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createListener: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createListenerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const applicationLoadBalancerArn = 'complicatedArn';
      const targetGroupArn = 'targetGroupArn/::qierd-stuff/';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createListener(applicationLoadBalancerArn, targetGroupArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createListener.args[0][0];

        expect(params).to.have.property('Protocol', protocol);
      });
    });

    it('should pass port to createListener method', () => {
      //Arrange
      let createListenerResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createListener: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createListenerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const applicationLoadBalancerArn = 'complicatedArn';
      const targetGroupArn = 'targetGroupArn/::qierd-stuff/';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createListener(applicationLoadBalancerArn, targetGroupArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createListener.args[0][0];

        expect(params).to.have.property('Port', port);
      });
    });

    it('should call createListener once', () => {
      //Arrange
      let createListenerResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createListener: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createListenerResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const applicationLoadBalancerArn = 'complicatedArn';
      const targetGroupArn = 'targetGroupArn/::qierd-stuff/';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService._createListener(applicationLoadBalancerArn, targetGroupArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        expect(awsElbv2ClientMock.createListener.callCount).to.be.equal(1);
      });
    });
  });

  describe('getTargetGroupArnFromName', () => {
    it('should pass targetGroupName to describeTargetGroups method', () => {
      //Arrange
      let describeTargetGroupsResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'targetGroup/Unique::/Arn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        describeTargetGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeTargetGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const targetGroupName = 'testUniqueName';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService.getTargetGroupArnFromName(targetGroupName);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.describeTargetGroups.args[0][0];

        expect(params.Names[0]).to.be.equal(targetGroupName);
      });
    });

    it('should return targetGroupArn if found', () => {
      //Arrange
      let describeTargetGroupsResponse = {
        TargetGroups: [
          {
            TargetGroupArn: 'targetGroup/Unique::/Arn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        describeTargetGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeTargetGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const targetGroupName = 'testUniqueName';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService.getTargetGroupArnFromName(targetGroupName);

      return resultPromise.then(foundTargetGroupArn => {
        expect(foundTargetGroupArn).to.be.equal(describeTargetGroupsResponse.TargetGroups[0].TargetGroupArn);
      });
    });

    it('should return empty string if NOT found', () => {
      //Arrange
      let describeTargetGroupsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        describeTargetGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeTargetGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const targetGroupName = 'testUniqueName';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService.getTargetGroupArnFromName(targetGroupName);

      return resultPromise.then(foundTargetGroupArn => {
        expect(foundTargetGroupArn).to.be.equal('');
      });
    });
  });

  describe('getApplicationLoadBalancerArnFromName', () => {
    it('should pass application load balancer name to describeLoadBalancers method', () => {
      //Arrange
      let describeLoadBalancersResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        describeLoadBalancers: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeLoadBalancersResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const appLBName = 'testUniqueName';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService.getApplicationLoadBalancerArnFromName(appLBName);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.describeLoadBalancers.args[0][0];

        expect(params.Names[0]).to.be.equal(appLBName);
      });
    });

    it('should return load balancer arn if found', () => {
      //Arrange
      let describeLoadBalancersResponse = {
        LoadBalancers: [
          {
            LoadBalancerArn: 'lbArn'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        describeLoadBalancers: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeLoadBalancersResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const appLBName = 'testUniqueName';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService.getApplicationLoadBalancerArnFromName(appLBName);

      return resultPromise.then(foundLoadBalancerArn => {
        expect(foundLoadBalancerArn).to.be.equal(describeLoadBalancersResponse.LoadBalancers[0].LoadBalancerArn);
      });
    });

    it('should return empty string if not found', () => {
      //Arrange
      let describeLoadBalancersResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        describeLoadBalancers: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeLoadBalancersResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const appLBName = 'testUniqueName';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService.getApplicationLoadBalancerArnFromName(appLBName);

      return resultPromise.then(foundLoadBalancerArn => {
        expect(foundLoadBalancerArn).to.be.equal('');
      });
    });
  });

  describe('_createTagsForElbV2', () => {
    it('should not throw error if tags parameter is not an array', () => {
      //Arrange
      let createTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const resourceId = 'elb-ajkfd91';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act && Assert
      try {
        let resultPromise = elbClientService._createTagsForElbV2(resourceId, null);
        return BluebirdPromise.resolve();
      } catch(err) {
        return BluebirdPromise.reject(err);
      }
    });

    it('should pass targetGroupArn to createTags method', () => {
      //Arrange
      let createTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const resourceId = 'elb-ajkfd91';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService._createTagsForElbV2(resourceId, null);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTags.args[0][0];

        expect(params.Resources[0]).to.be.equal(resourceId);
      });
    });

    it('should pass tags to addTags method', () => {
      //Arrange
      let createTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const resourceId = 'elb-ajkfd91';
      const tags = [
        {Key: 'Name', Value: 'stuff'}
      ];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService._createTagsForElbV2(resourceId, tags);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTags.args[0][0];

        expect(params.Tags).to.be.deep.equal(tags);
      });
    });

    it('should pass Created Tag to createTags method when parameter is not included', () => {
      //Arrange
      let createTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const resourceId = 'elb-ajkfd91';
      const tags = [
        {Key: 'Name', Value: 'stuff'}
      ];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService._createTagsForElbV2(resourceId, tags);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTags.args[0][0];

        expect(params.Tags.length).to.be.equal(2);

        let nameTag = __.filter(params.Tags, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Key', 'Name');
        expect(nameTag[0]).to.have.property('Value', 'stuff');

        let createdTag = __.filter(params.Tags, {Key: 'Created'});
        expect(createdTag[0]).to.have.property('Key', 'Created');
        expect(createdTag[0].Value).to.match(/.*T.*/);
      });
    });

    it('should NOT pass Created Tag to createTags method when parameter is set to false', () => {
      //Arrange
      let createTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const resourceId = 'elb-ajkfd91';
      const tags = [
        {Key: 'Name', Value: 'stuff'}
      ];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService._createTagsForElbV2(resourceId, tags, false);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.createTags.args[0][0];

        expect(params.Tags.length).to.be.equal(1);

        let nameTag = __.filter(params.Tags, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Key', 'Name');
        expect(nameTag[0]).to.have.property('Value', 'stuff');
      });
    });
  });

  describe('_createTagsForTargetGroup', () => {


    it('should not throw error if tags parameter is not an array', () => {
      //Arrange
      let addTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        addTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(addTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const targetGroupArn = 'complicatedArn';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act && Assert
      try {
        let resultPromise = elbClientService._createTagsForTargetGroup(targetGroupArn, null);
        return BluebirdPromise.resolve();
      } catch(err) {
        return BluebirdPromise.reject(err);
      }
    });

    it('should pass targetGroupArn to addTags method', () => {
      //Arrange
      let addTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        addTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(addTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const targetGroupArn = 'complicatedArn';

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService._createTagsForTargetGroup(targetGroupArn, null);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.addTags.args[0][0];

        expect(params.ResourceArns[0]).to.be.equal(targetGroupArn);
      });
    });

    it('should pass tags to addTags method', () => {
      //Arrange
      let addTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        addTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(addTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const targetGroupArn = 'complicatedArn';
      const tags = [
        {Key: 'Name', Value: 'stuff'}
      ];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService._createTagsForTargetGroup(targetGroupArn, tags);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.addTags.args[0][0];

        expect(params.Tags).to.be.deep.equal(tags);
      });
    });

    it('should pass Created Tag to addTags method when parameter is not included', () => {
      //Arrange
      let addTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        addTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(addTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const targetGroupArn = 'complicatedArn';
      const tags = [
        {Key: 'Name', Value: 'stuff'}
      ];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService._createTagsForTargetGroup(targetGroupArn, tags);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.addTags.args[0][0];

        expect(params.Tags.length).to.be.equal(2);

        let nameTag = __.filter(params.Tags, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Key', 'Name');
        expect(nameTag[0]).to.have.property('Value', 'stuff');

        let createdTag = __.filter(params.Tags, {Key: 'Created'});
        expect(createdTag[0]).to.have.property('Key', 'Created');
        expect(createdTag[0].Value).to.match(/.*T.*/);
      });
    });

    it('should NOT pass Created Tag to addTags method when parameter is set to false', () => {
      //Arrange
      let addTagsResponse = { };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        addTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(addTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const targetGroupArn = 'complicatedArn';
      const tags = [
        {Key: 'Name', Value: 'stuff'}
      ];

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();

      let resultPromise = elbClientService._createTagsForTargetGroup(targetGroupArn, tags, false);

      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.addTags.args[0][0];

        expect(params.Tags.length).to.be.equal(1);

        let nameTag = __.filter(params.Tags, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Key', 'Name');
        expect(nameTag[0]).to.have.property('Value', 'stuff');
      });
    });
  });

  describe('getListenerArn', () => {
    it('should pass applicationLoadBalancerArn to describeListeners', () => {
      //Arrange
      let describeListenersResponse = {
        Listeners: []
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        describeListeners: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeListenersResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      const applicationLoadBalancerArn = 'complicatedArn';
      const protocol = 'HTTP';
      const port = 80;

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService.getListenerArn(applicationLoadBalancerArn, protocol, port);

      //Assert
      return resultPromise.then(() => {
        let params = awsElbv2ClientMock.describeListeners.args[0][0];

        expect(params).to.have.property('LoadBalancerArn', applicationLoadBalancerArn);
      });
    });

    it('should parse listeners based on given port and protocol and return matching Arn', () => {
      //Arrange
      const applicationLoadBalancerArn = 'complicatedArn';
      const protocol = 'HTTP';
      const port = 80;

      let describeListenersResponse = {
        Listeners: [
          {
            ListenerArn: 'listenerArn',
            LoadBalancerArn: applicationLoadBalancerArn,
            Protocol: protocol,
            Port: port
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        describeListeners: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeListenersResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService.getListenerArn(applicationLoadBalancerArn, protocol, port);

      //Assert
      return resultPromise.then(foundListenerArn => {
        console.log(foundListenerArn);
        expect(foundListenerArn).to.be.equal(describeListenersResponse.Listeners[0].ListenerArn);
      });
    });

    it('should return empty string if no matching listener', () => {
      //Arrange
      const applicationLoadBalancerArn = 'complicatedArn';
      const protocol = 'HTTP';
      const port = 80;

      let describeListenersResponse = {
        Listeners: [
          {
            ListenerArn: 'listenerArn',
            LoadBalancerArn: applicationLoadBalancerArn,
            Protocol: protocol,
            Port: 8080
          }
        ]
      };

      //setting up ec2Client Mock
      let awsElbv2ClientMock = {
        describeListeners: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeListenersResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ELBv2: () => {
          return awsElbv2ClientMock;
        }
      });

      //Setting up VPC clients
      const ELB = require('../src/elbClient.js');
      const elbClientService = new ELB();


      //Act
      let resultPromise = elbClientService.getListenerArn(applicationLoadBalancerArn, protocol, port);

      //Assert
      return resultPromise.then(foundListenerArn => {
        console.log(foundListenerArn);
        expect(foundListenerArn).to.be.equal('');
      });
    });
  });
});
