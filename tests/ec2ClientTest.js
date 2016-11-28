const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const mockery = require('mockery');
const __ = require('lodash');
const BluebirdPromise = require('bluebird');


require('sinon-as-promised');
chai.use(chaiAsPromised);




describe('EC2 Client', function() {
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


  describe('createSecurityGroupFromConfig', () => {
    const ENVIRONMENT = 'testenv';
    it('should pass securityGroupName to getSecurityGroupIdFromName method', () => {
      //Arrange
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();
      let getSecurityGroupIdFromNameStub = sandbox.stub(ec2ClientService, 'getSecurityGroupIdFromName', () => {
        return Promise.resolve('uniqueSGId1');
      });


      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(getSecurityGroupIdFromNameStub.args[0][0]).to.be.equal('dupeName');
      });
    });

    it('should pass vpcId to getSecurityGroupIdFromName method', () => {
      //Arrange
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();
      let getSecurityGroupIdFromNameStub = sandbox.stub(ec2ClientService, 'getSecurityGroupIdFromName', () => {
        return Promise.resolve('uniqueSGId1');
      });

      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(getSecurityGroupIdFromNameStub.args[0][1]).to.be.equal('123abc');
      });
    });

    it('should not call createSecurityGroup if securityGroup already exists', () => {
      //Arrange
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();
      sandbox.stub(ec2ClientService, 'getSecurityGroupIdFromName', () => {
        return Promise.resolve('uniqueSGId1');
      });

      let createSecurityGroupStub = sandbox.stub(ec2ClientService, '_createSecurityGroup');

      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(createSecurityGroupStub.calledOnce).to.be.false;
      });
    });

    it('should call createSecurityGroup if securityGroup doesnt exist', () => {
      //Arrange
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();
      sandbox.stub(ec2ClientService, 'getSecurityGroupIdFromName', () => {
        return Promise.resolve('');
      });

      let createSecurityGroupStub = sandbox.stub(ec2ClientService, '_createSecurityGroup');

      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(createSecurityGroupStub.calledOnce).to.be.true;
      });
    });

    it('should pass environment parameter to createSecuritygroup', () => {
      //Arrange
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      sandbox.stub(ec2ClientService, 'getSecurityGroupIdFromName', () => {
        return Promise.resolve('');
      });

      let createSecurityGroupStub = sandbox.stub(ec2ClientService, '_createSecurityGroup');

      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(createSecurityGroupStub.args[0][0]).to.be.equal(ENVIRONMENT);
      });
    });
  });

  describe('getSecurityGroupIdFromName', () => {
    const ENVIRONMENT = 'testenv';
    it('should pass securityGroupName to aws client', () => {
      //Arrange

      let describeSecurityGroupsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSecurityGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSecurityGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();


      //Act
      let resultPromise = ec2ClientService.getSecurityGroupIdFromName('dupeName', '123abc');

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeSecurityGroups.args[0][0];

        expect(params.DryRun).to.be.false;

        let groupNameFilter = __.filter(params.Filters, {Name: 'group-name'});
        expect(groupNameFilter[0].Values[0]).to.be.equal('dupeName');
      });
    });

    it('should pass VpcId to list of filters', () => {
      //Arrange

      let describeSecurityGroupsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSecurityGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSecurityGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 client
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();


      //Act
      let resultPromise = ec2ClientService.getSecurityGroupIdFromName('dupeName', '123abc');

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeSecurityGroups.args[0][0];

        expect(params.DryRun).to.be.false;

        let vpcIdFilter = __.filter(params.Filters, {Name: 'vpc-id'});
        expect(vpcIdFilter[0].Values[0]).to.be.equal('123abc');
      });
    });

    it('should not pass vpc-id filter to params when vpcId is null', () => {
      //Arrange

      let describeSecurityGroupsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSecurityGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSecurityGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 client
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();


      //Act
      let resultPromise = ec2ClientService.getSecurityGroupIdFromName('dupeName');

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeSecurityGroups.args[0][0];

        expect(params.DryRun).to.be.false;

        let vpcIdFilter = __.filter(params.Filters, {Name: 'vpc-id'});
        expect(vpcIdFilter[0]).to.be.undefined;
      });
    });

    it('should return groupId from valid response', () => {
      //Arrange

      let describeSecurityGroupsResponse = {
        SecurityGroups: [
          {
            GroupId: 'id123'
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSecurityGroups: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSecurityGroupsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 client
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();


      //Act
      let resultPromise = ec2ClientService.getSecurityGroupIdFromName('dupeName');

      //Assert
      return resultPromise.then(securityGroupId => {
        expect(securityGroupId).to.be.equal(describeSecurityGroupsResponse.SecurityGroups[0].GroupId);
      });
    });

  });

  describe('_createTags', () => {
    it('should not throw error if tags parameter is not an array', () => {
      //Arrange
      let createTagsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();


      const testResourceId = 'testResourceId';

      //Act
      try {
        let resultPromise = ec2ClientService._createTags(testResourceId, null);
        return BluebirdPromise.resolve();
      } catch(err) {
        return BluebirdPromise.reject(err);
      }

    });

    it('should pass resourceId to createTags method', () => {
      //Arrange

      let createTagsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();


      const testResourceId = 'testResourceId';

      //Act
      let resultPromise = ec2ClientService._createTags(testResourceId, []);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createTags.args[0][0];

        expect(params.DryRun).to.be.false;
        expect(params.Resources[0]).to.be.equal(testResourceId);
      });
    });

    it('should pass tags array to createTags method', () => {
      //Arrange

      let createTagsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();


      const testResourceId = 'testResourceId';
      const tagsArray = [{Key: 'Name', Value: 'value1'}];

      //Act
      let resultPromise = ec2ClientService._createTags(testResourceId, tagsArray);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createTags.args[0][0];

        expect(params.DryRun).to.be.false;

        let nameTag = __.filter(params.Tags, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Key', 'Name');
        expect(nameTag[0]).to.have.property('Value', 'value1');
      });
    });

    it('should pass Created Tag to createTags method when parameter is not included', () => {
      //Arrange

      let createTagsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();


      const testResourceId = 'testResourceId';
      const tagsArray = [{Key: 'Name', Value: 'value1'}];

      //Act
      let resultPromise = ec2ClientService._createTags(testResourceId, tagsArray);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createTags.args[0][0];

        expect(params.DryRun).to.be.false;
        expect(params.Tags.length).to.be.equal(2);

        let nameTag = __.filter(params.Tags, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Key', 'Name');
        expect(nameTag[0]).to.have.property('Value', 'value1');

        let createdTag = __.filter(params.Tags, {Key: 'Created'});
        expect(createdTag[0]).to.have.property('Key', 'Created');
        expect(createdTag[0].Value).to.match(/.*T.*/);
      });
    });

    it('should NOT pass Created Tag to createTags method when parameter is set to false', () => {
      //Arrange

      let createTagsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();


      const testResourceId = 'testResourceId';
      const tagsArray = [{Key: 'Name', Value: 'value1'}];

      //Act
      let resultPromise = ec2ClientService._createTags(testResourceId, tagsArray, false);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createTags.args[0][0];

        expect(params.DryRun).to.be.false;
        expect(params.Tags.length).to.be.equal(1);

        let nameTag = __.filter(params.Tags, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Key', 'Name');
        expect(nameTag[0]).to.have.property('Value', 'value1');
      });
    });

  });

  describe('_createSecurityGroup', () => {
    const ENVIRONMENT = 'testenv';
    it('should pass sgName parameter to createSecurityGroup params', () => {
      //Arrange

      let createSecurityGroupResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSecurityGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSecurityGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._createTags = sandbox.stub().resolves();
      ec2ClientService._createSecurityGroupRules = sandbox.stub().resolves();


      const sgName = 'securityGroupName';
      const description = 'some description';
      const vpcId = 'abc123';
      const securityGroupRules = [];

      //Act
      let resultPromise = ec2ClientService._createSecurityGroup(ENVIRONMENT, sgName, description, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createSecurityGroup.args[0][0];

        expect(params.GroupName).to.be.equal(sgName);
      });
    });

    it('should pass description parameter to createSecurityGroup params', () => {
      //Arrange

      let createSecurityGroupResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSecurityGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSecurityGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._createTags = sandbox.stub().resolves();
      ec2ClientService._createSecurityGroupRules = sandbox.stub().resolves();


      const sgName = 'securityGroupName';
      const description = 'some description';
      const vpcId = 'abc123';
      const securityGroupRules = [];

      //Act
      let resultPromise = ec2ClientService._createSecurityGroup(ENVIRONMENT, sgName, description, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createSecurityGroup.args[0][0];

        expect(params.Description).to.be.equal(description);
      });
    });

    it('should pass vpcId parameter when its passed into createSecurityGroup params', () => {
      //Arrange

      let createSecurityGroupResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSecurityGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSecurityGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._createTags = sandbox.stub().resolves();
      ec2ClientService._createSecurityGroupRules = sandbox.stub().resolves();


      const sgName = 'securityGroupName';
      const description = 'some description';
      const vpcId = 'abc123';
      const securityGroupRules = [];

      //Act
      let resultPromise = ec2ClientService._createSecurityGroup(ENVIRONMENT, sgName, description, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createSecurityGroup.args[0][0];

        expect(params.VpcId).to.be.equal(vpcId);
      });
    });

    it('should NOT pass vpcId parameter when its null into createSecurityGroup params', () => {
      //Arrange

      let createSecurityGroupResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSecurityGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSecurityGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._createTags = sandbox.stub().resolves();
      ec2ClientService._createSecurityGroupRules = sandbox.stub().resolves();


      const sgName = 'securityGroupName';
      const description = 'some description';
      const vpcId = 'abc123';
      const securityGroupRules = [];

      //Act
      let resultPromise = ec2ClientService._createSecurityGroup(ENVIRONMENT, sgName, description, null, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createSecurityGroup.args[0][0];

        expect(params.VpcId).to.be.undefined;
      });
    });

    it('should return created securityGroupId', () => {
      //Arrange

      let createSecurityGroupResponse = {
        GroupId: 'sgId1'
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSecurityGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSecurityGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._createTags = sandbox.stub().resolves();
      ec2ClientService._createSecurityGroupRules = sandbox.stub().resolves();


      const sgName = 'securityGroupName';
      const description = 'some description';
      const securityGroupRules = [];

      //Act
      let resultPromise = ec2ClientService._createSecurityGroup(ENVIRONMENT, sgName, description, null, securityGroupRules);

      //Assert
      return resultPromise.then(createdSecurityGroupId => {

        expect(createdSecurityGroupId).to.be.equal(createSecurityGroupResponse.GroupId);
      });
    });

    it('should call _createTags', () => {
      //Arrange

      let createSecurityGroupResponse = {
        GroupId: 'sgId1'
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSecurityGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSecurityGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._createTags = sandbox.stub().resolves();
      ec2ClientService._createSecurityGroupRules = sandbox.stub().resolves();


      const sgName = 'securityGroupName';
      const description = 'some description';
      const securityGroupRules = [{egress: false}];

      //Act
      let resultPromise = ec2ClientService._createSecurityGroup(ENVIRONMENT, sgName, description, null, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let createTagsParams = ec2ClientService._createTags.args[0];

        expect(createTagsParams[0]).to.be.equal(createSecurityGroupResponse.GroupId);
        expect(createTagsParams[1].length).to.be.equal(2);

      });
    });

    it('should call _createSecurityGroupRules once', () => {
      //Arrange

      let createSecurityGroupResponse = {
        GroupId: 'sgId1'
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSecurityGroup: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSecurityGroupResponse)} })
      };

      mockery.registerMock('aws-sdk', {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      });

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._createTags = sandbox.stub().resolves();
      ec2ClientService._createSecurityGroupRules = sandbox.stub().resolves();


      const sgName = 'securityGroupName';
      const description = 'some description';
      const vpcId = 'vpc-123';
      const securityGroupRules = [{egress: false}];

      //Act
      let resultPromise = ec2ClientService._createSecurityGroup(ENVIRONMENT, sgName, description, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let createSecurityGroupRulesParams = ec2ClientService._createSecurityGroupRules.args[0];

        expect(createSecurityGroupRulesParams[0]).to.be.equal(createSecurityGroupResponse.GroupId);
        expect(createSecurityGroupRulesParams[1]).to.be.equal(vpcId);
        expect(createSecurityGroupRulesParams[2].length).to.be.equal(securityGroupRules.length);

      });
    });
  });

  describe('_createSecurityGroupRules', () => {

  });

  describe('_authorizeSecurityGroup', () => {

  });

});
