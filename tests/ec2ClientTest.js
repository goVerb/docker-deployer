const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const __ = require('lodash');
const BluebirdPromise = require('bluebird');
import proxyquire from 'proxyquire';



chai.use(chaiAsPromised);




describe('EC2 Client', function() {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getter _awsEc2Client', () => {
    it('should pass accessKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: sandbox.stub()

      };

      //Setting up EC2 clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
      const ec2ClientService = new EC2(accessKey, secretKey, region);


      //Act
      ec2ClientService._awsEc2Client;

      //Assert
      let params = mockAwsSdk.EC2.args[0][0];
      expect(params).to.have.property('accessKeyId', accessKey);
    });

    it('should pass secretKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: sandbox.stub()

      };


      //Setting up EC2 clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
      const ec2ClientService = new EC2(accessKey, secretKey, region);


      //Act
      ec2ClientService._awsEc2Client;

      //Assert
      let params = mockAwsSdk.EC2.args[0][0];
      expect(params).to.have.property('secretAccessKey', secretKey);
    });

    it('should pass region to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: sandbox.stub()

      };


      //Setting up EC2 clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
      const ec2ClientService = new EC2(accessKey, secretKey, region);


      //Act
      ec2ClientService._awsEc2Client;

      //Assert
      let params = mockAwsSdk.EC2.args[0][0];
      expect(params).to.have.property('region', region);
    });

    it('should pass default region of us-west-2 if none specified', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: sandbox.stub()

      };


      //Setting up EC2 clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
      const ec2ClientService = new EC2(accessKey, secretKey);


      //Act
      ec2ClientService._awsEc2Client;

      //Assert
      let params = mockAwsSdk.EC2.args[0][0];
      expect(params).to.have.property('region', 'us-west-2');
    });
  });

  describe('createSecurityGroupFromConfig', () => {
    const ENVIRONMENT = 'testenv';
    it('should pass securityGroupName to getSecurityGroupIdFromName method', () => {
      //Arrange
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('uniqueSGId1');

      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(ec2ClientService.getSecurityGroupIdFromName.args[0][0]).to.be.equal('dupeName');
      });
    });

    it('should pass vpcId to getSecurityGroupIdFromName method', () => {
      //Arrange
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('uniqueSGId1');
      

      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(ec2ClientService.getSecurityGroupIdFromName.args[0][1]).to.be.equal('123abc');
      });
    });

    it('should not call createSecurityGroup if securityGroup already exists', () => {
      //Arrange
      const EC2 = require('../src/ec2Client.js');
      const ec2ClientService = new EC2();
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('uniqueSGId1');

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
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('');

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
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('');

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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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
      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 client
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 client
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };


      //Setting up EC2 client
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const EC2 = proxyquire('../src/ec2Client', mocks);
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
    it('should pass securityGroupId to _authorizeSecurityGroup', () => {
      //Arrange

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._authorizeSecurityGroup = sandbox.stub().resolves({});
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('');


      const securityGroupId = 'sg1';
      const vpcId = 'vpc-123abc';
      const securityGroupRules = [];
      const singleRule = {
        egress: true,
        protocol: 'TCP',
        fromPort: 123,
        toPort: 456,
        allowedIpCidrBlock: '0.0.0.0/0'
      };
      securityGroupRules.push(singleRule);

      //Act
      let resultPromise = ec2ClientService._createSecurityGroupRules(securityGroupId, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = ec2ClientService._authorizeSecurityGroup.args[0];

        expect(params[0]).to.be.equal(securityGroupId);
      });
    });

    it('should pass rule.egress parameter to _authorizeSecurityGroup', () => {
      //Arrange

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._authorizeSecurityGroup = sandbox.stub().resolves({});
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('');


      const securityGroupId = 'sg1';
      const vpcId = 'vpc-123abc';
      const securityGroupRules = [];
      const singleRule = {
        egress: true,
        protocol: 'TCP',
        fromPort: 123,
        toPort: 456,
        allowedIpCidrBlock: '0.0.0.0/0'
      };
      securityGroupRules.push(singleRule);

      //Act
      let resultPromise = ec2ClientService._createSecurityGroupRules(securityGroupId, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = ec2ClientService._authorizeSecurityGroup.args[0];

        expect(params[1]).to.be.equal(singleRule.egress);
      });
    });


    it('should pass rule.protocol parameter to _authorizeSecurityGroup', () => {
      //Arrange

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._authorizeSecurityGroup = sandbox.stub().resolves({});
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('');


      const securityGroupId = 'sg1';
      const vpcId = 'vpc-123abc';
      const securityGroupRules = [];
      const singleRule = {
        egress: true,
        protocol: 'TCP',
        fromPort: 123,
        toPort: 456,
        allowedIpCidrBlock: '0.0.0.0/0'
      };
      securityGroupRules.push(singleRule);

      //Act
      let resultPromise = ec2ClientService._createSecurityGroupRules(securityGroupId, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = ec2ClientService._authorizeSecurityGroup.args[0];

        expect(params[2]).to.be.equal(singleRule.protocol);
      });
    });

    it('should pass rule.fromPort parameter to _authorizeSecurityGroup', () => {
      //Arrange

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._authorizeSecurityGroup = sandbox.stub().resolves({});
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('');


      const securityGroupId = 'sg1';
      const vpcId = 'vpc-123abc';
      const securityGroupRules = [];
      const singleRule = {
        egress: true,
        protocol: 'TCP',
        fromPort: 123,
        toPort: 456,
        allowedIpCidrBlock: '0.0.0.0/0'
      };
      securityGroupRules.push(singleRule);

      //Act
      let resultPromise = ec2ClientService._createSecurityGroupRules(securityGroupId, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = ec2ClientService._authorizeSecurityGroup.args[0];

        expect(params[3]).to.be.equal(singleRule.fromPort);
      });
    });

    it('should pass rule.toPort parameter to _authorizeSecurityGroup', () => {
      //Arrange

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._authorizeSecurityGroup = sandbox.stub().resolves({});
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('');


      const securityGroupId = 'sg1';
      const vpcId = 'vpc-123abc';
      const securityGroupRules = [];
      const singleRule = {
        egress: true,
        protocol: 'TCP',
        fromPort: 123,
        toPort: 456,
        allowedIpCidrBlock: '0.0.0.0/0'
      };
      securityGroupRules.push(singleRule);

      //Act
      let resultPromise = ec2ClientService._createSecurityGroupRules(securityGroupId, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = ec2ClientService._authorizeSecurityGroup.args[0];

        expect(params[4]).to.be.equal(singleRule.toPort);
      });
    });

    it('should pass rule.allowedIpCidrBlock parameter to _authorizeSecurityGroup', () => {
      //Arrange

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._authorizeSecurityGroup = sandbox.stub().resolves({});
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('');


      const securityGroupId = 'sg1';
      const vpcId = 'vpc-123abc';
      const securityGroupRules = [];
      const singleRule = {
        egress: true,
        protocol: 'TCP',
        fromPort: 123,
        toPort: 456,
        allowedIpCidrBlock: '0.0.0.0/0'
      };
      securityGroupRules.push(singleRule);

      //Act
      let resultPromise = ec2ClientService._createSecurityGroupRules(securityGroupId, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = ec2ClientService._authorizeSecurityGroup.args[0];

        expect(params[5]).to.be.equal(singleRule.allowedIpCidrBlock);
      });
    });

    it('should pass rule.allowedSecurityGroupId parameter to _authorizeSecurityGroup', () => {
      //Arrange

      let linkedSecurityGroupId = 'sg-apple';
      let linkedSecurityGroupName = 'linkedName';
      let sharedVpcId = 'vpc-123abc';

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._authorizeSecurityGroup = sandbox.stub().resolves({});
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().withArgs(linkedSecurityGroupName, sharedVpcId).resolves(linkedSecurityGroupId);


      const securityGroupId = 'sg1';
      const vpcId = sharedVpcId;
      const securityGroupRules = [];
      const singleRule = {
        egress: true,
        protocol: 'TCP',
        fromPort: 123,
        toPort: 456,
        allowedSecurityGroupName: linkedSecurityGroupName
      };
      securityGroupRules.push(singleRule);

      //Act
      let resultPromise = ec2ClientService._createSecurityGroupRules(securityGroupId, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        let params = ec2ClientService._authorizeSecurityGroup.args[0];

        expect(params[6]).to.be.equal(linkedSecurityGroupId);
      });
    });

    it('should call getSecurityGroupIdFromName', () => {
      //Arrange
      let linkedSecurityGroupName = 'linkedName';
      let sharedVpcId = 'vpc-123abc';

      //Setting up EC2 clients
      const EC2 = require('../src/ec2Client');
      const ec2ClientService = new EC2();
      ec2ClientService._authorizeSecurityGroup = sandbox.stub().resolves({});
      ec2ClientService.getSecurityGroupIdFromName = sandbox.stub().resolves('');


      const securityGroupId = 'sg1';
      const vpcId = sharedVpcId;
      const securityGroupRules = [];
      const singleRule = {
        egress: true,
        protocol: 'TCP',
        fromPort: 123,
        toPort: 456,
        allowedSecurityGroupName: linkedSecurityGroupName
      };
      securityGroupRules.push(singleRule);

      //Act
      let resultPromise = ec2ClientService._createSecurityGroupRules(securityGroupId, vpcId, securityGroupRules);

      //Assert
      return resultPromise.then(() => {
        expect(ec2ClientService.getSecurityGroupIdFromName.calledOnce).to.be.true;
      });
    });
  });

  describe('_authorizeSecurityGroup', () => {
    it('should pass securityGroupId in params to authorizeSecurityGroupEgress', () => {

      //Arrange
      let authorizeSecurityGroupEgressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupEgress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupEgressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = true;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupEgressParams = awsEc2ClientMock.authorizeSecurityGroupEgress.args[0][0];


        expect(authorizeSecurityGroupEgressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupEgressParams).to.have.property('GroupId', securityGroupId);
      });
    });

    it('should pass protocol in params to authorizeSecurityGroupEgress', () => {
      //Arrange
      let authorizeSecurityGroupEgressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupEgress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupEgressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = true;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupEgressParams = awsEc2ClientMock.authorizeSecurityGroupEgress.args[0][0];


        expect(authorizeSecurityGroupEgressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupEgressParams.IpPermissions[0]).to.have.property('IpProtocol', protocol);
      });
    });

    it('should pass fromPort in params to authorizeSecurityGroupEgress', () => {
      //Arrange
      let authorizeSecurityGroupEgressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupEgress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupEgressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = true;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupEgressParams = awsEc2ClientMock.authorizeSecurityGroupEgress.args[0][0];


        expect(authorizeSecurityGroupEgressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupEgressParams.IpPermissions[0]).to.have.property('FromPort', fromPort);
      });
    });

    it('should pass toPort in params to authorizeSecurityGroupEgress', () => {
      //Arrange
      let authorizeSecurityGroupEgressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupEgress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupEgressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = true;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupEgressParams = awsEc2ClientMock.authorizeSecurityGroupEgress.args[0][0];


        expect(authorizeSecurityGroupEgressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupEgressParams.IpPermissions[0]).to.have.property('ToPort', toPort);
      });
    });

    it('should pass allowedIpCidrBlock to authorizeSecurityGroupEgress', () => {
      //Arrange
      let authorizeSecurityGroupEgressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupEgress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupEgressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = true;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupEgressParams = awsEc2ClientMock.authorizeSecurityGroupEgress.args[0][0];


        expect(authorizeSecurityGroupEgressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupEgressParams.IpPermissions[0].IpRanges[0]).to.have.property('CidrIp', allowedIpCidrBlock);
      });
    });

    it('should pass allowedSecurityGroupId to authorizeSecurityGroupEgress', () => {
      //Arrange
      let authorizeSecurityGroupEgressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupEgress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupEgressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = true;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = null;
      const allowedSecurityGroupId = 'allowed-sg2';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock, allowedSecurityGroupId);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupEgressParams = awsEc2ClientMock.authorizeSecurityGroupEgress.args[0][0];


        expect(authorizeSecurityGroupEgressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupEgressParams.IpPermissions[0].UserIdGroupPairs[0]).to.have.property('GroupId', allowedSecurityGroupId);
      });
    });

    it('should call authorizeSecurityGroupEgress when egress is true', () => {
      //Arrange
      let authorizeSecurityGroupEgressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupEgress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupEgressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = true;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = null;
      const allowedSecurityGroupId = 'allowed-sg2';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock, allowedSecurityGroupId);

      //Assert
      return resultPromise.then(() => {
        expect(awsEc2ClientMock.authorizeSecurityGroupEgress.calledOnce).to.be.true;
      });
    });

    it('should pass securityGroupId in params to authorizeSecurityGroupIngress', () => {
      //Arrange
      let authorizeSecurityGroupIngressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupIngress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupIngressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = false;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupIngressParams = awsEc2ClientMock.authorizeSecurityGroupIngress.args[0][0];


        expect(authorizeSecurityGroupIngressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupIngressParams).to.have.property('GroupId', securityGroupId);
      });
    });

    it('should pass protocol in params to authorizeSecurityGroupIngress', () => {
      //Arrange
      let authorizeSecurityGroupIngressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupIngress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupIngressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = false;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupIngressParams = awsEc2ClientMock.authorizeSecurityGroupIngress.args[0][0];


        expect(authorizeSecurityGroupIngressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupIngressParams.IpPermissions[0]).to.have.property('IpProtocol', protocol);
      });
    });

    it('should pass fromPort in params to authorizeSecurityGroupIngress', () => {
      //Arrange
      let authorizeSecurityGroupIngressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupIngress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupIngressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = false;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupIngressParams = awsEc2ClientMock.authorizeSecurityGroupIngress.args[0][0];


        expect(authorizeSecurityGroupIngressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupIngressParams.IpPermissions[0]).to.have.property('FromPort', fromPort);
      });
    });

    it('should pass toPort in params to authorizeSecurityGroupIngress', () => {
      //Arrange
      let authorizeSecurityGroupIngressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupIngress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupIngressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = false;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupIngressParams = awsEc2ClientMock.authorizeSecurityGroupIngress.args[0][0];


        expect(authorizeSecurityGroupIngressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupIngressParams.IpPermissions[0]).to.have.property('ToPort', toPort);
      });
    });

    it('should pass allowedIpCidrBlock to authorizeSecurityGroupIngress', () => {
      //Arrange
      let authorizeSecurityGroupIngressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupIngress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupIngressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = false;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = '0.0.0.0/0';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupIngressParams = awsEc2ClientMock.authorizeSecurityGroupIngress.args[0][0];


        expect(authorizeSecurityGroupIngressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupIngressParams.IpPermissions[0].IpRanges[0]).to.have.property('CidrIp', allowedIpCidrBlock);
      });
    });

    it('should pass allowedSecurityGroupId to authorizeSecurityGroupIngress', () => {
      //Arrange
      let authorizeSecurityGroupIngressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupIngress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupIngressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = false;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = null;
      const allowedSecurityGroupId = 'allowed-sg2';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock, allowedSecurityGroupId);

      //Assert
      return resultPromise.then(() => {
        let authorizeSecurityGroupIngressParams = awsEc2ClientMock.authorizeSecurityGroupIngress.args[0][0];


        expect(authorizeSecurityGroupIngressParams.DryRun).to.be.false;
        expect(authorizeSecurityGroupIngressParams.IpPermissions[0].UserIdGroupPairs[0]).to.have.property('GroupId', allowedSecurityGroupId);
      });
    });

    it('should call authorizeSecurityGroupIngress when egress is false', () => {
      //Arrange
      let authorizeSecurityGroupIngressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupIngress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupIngressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = false;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = null;
      const allowedSecurityGroupId = 'allowed-sg2';

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock, allowedSecurityGroupId);

      //Assert
      return resultPromise.then(() => {
        expect(awsEc2ClientMock.authorizeSecurityGroupIngress.calledOnce).to.be.true;
      });
    });

    it('should throw an error if allowedIpCidrBlock and allowedSecurityGroupId are null', () => {
      //Arrange
      let authorizeSecurityGroupIngressResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        authorizeSecurityGroupIngress: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(authorizeSecurityGroupIngressResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: () => {
          return awsEc2ClientMock;
        }
      };

      //Setting up EC2 clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const EC2 = proxyquire('../src/ec2Client.js', mocks);
      const ec2ClientService = new EC2();


      const securityGroupId = 'sg1';
      const egress = false;
      const protocol = 'TCP';
      const fromPort = 123;
      const toPort = 456;
      const allowedIpCidrBlock = null;
      const allowedSecurityGroupId = null;

      //Act
      let resultPromise = ec2ClientService._authorizeSecurityGroup(securityGroupId, egress, protocol, fromPort, toPort, allowedIpCidrBlock, allowedSecurityGroupId);

      //Assert
      return resultPromise.catch(err => {
        console.log(err.message);
        expect(err.message).to.equal(`There is no valid allowed scope. [SecurityGroupId: ${securityGroupId}] [AllowedIpCidrBlock: null] [AllowedSecurityGroupId: null]`)
      });
    });


  });

});
