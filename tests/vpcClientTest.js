const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const __ = require('lodash');
const BluebirdPromise = require('bluebird');
import proxyquire from 'proxyquire';



chai.use(chaiAsPromised);



describe('VPC Client', function() {
  this.timeout(10000);
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

      //Setting up VPC clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC(accessKey, secretKey, region);


      //Act
      vpcClientService._awsEc2Client;

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


      //Setting up VPC clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC(accessKey, secretKey, region);


      //Act
      vpcClientService._awsEc2Client;

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

      //Setting up VPC clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC(accessKey, secretKey, region);


      //Act
      vpcClientService._awsEc2Client;

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

      //Setting up VPC clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC(accessKey, secretKey);


      //Act
      vpcClientService._awsEc2Client;

      //Assert
      let params = mockAwsSdk.EC2.args[0][0];
      expect(params).to.have.property('region', 'us-west-2');
    });
  });

  describe('getAvailabilityZones', () => {
    let VPC;
    let vpcClientService;
    beforeEach(() => {
      VPC = require('../src/vpcClient');
      vpcClientService = new VPC();
      vpcClientService._awsEc2Client.describeAvailabilityZones = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          AvailabilityZones: [
             {
            Messages: [
            ],
            RegionName: "us-east-1",
            State: "available",
            ZoneName: "us-east-1b"
           },
             {
            Messages: [
            ],
            RegionName: "us-east-1",
            State: "available",
            ZoneName: "us-east-1c"
           },
             {
            Messages: [
            ],
            RegionName: "us-east-1",
            State: "available",
            ZoneName: "us-east-1d"
           },
             {
            Messages: [
            ],
            RegionName: "us-east-1",
            State: "available",
            ZoneName: "us-east-1e"
           }
          ]
         })
      });
    });

    afterEach(() => {
      VPC = null;
      vpcClientService = null;
    });

    it('should call _awsEc2Client.describeAvailabilityZones once', async () => {
      //Act
      await vpcClientService.getAvailabilityZones();
      //Assert
      expect(vpcClientService._awsEc2Client.describeAvailabilityZones.calledOnce).to.be.true;
    });

    it('should call _awsEc2Client.describeAvailabilityZones with a region filter', async () => {
      //Arrange
      let expectedFilter = {
        Filters: [
          {
            Name: 'region-name',
            Values: [
              vpcClientService._region
            ]
          }
        ]
      };
      //Act
      await vpcClientService.getAvailabilityZones();
      //Assert
      expect(vpcClientService._awsEc2Client.describeAvailabilityZones.args[0][0]).to.deep.equal(expectedFilter);
    });

    it('should return an empty array if no available zones is returned', async () => {
      //Arrange
      vpcClientService._awsEc2Client.describeAvailabilityZones = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          AvailabilityZones: []
        })
      });
      //Act
      let result = await vpcClientService.getAvailabilityZones();
      //Assert
      expect(result).to.deep.equal([]);
    });

    it('should return an array with all the available availabilityZones names', async () => {
      //Arrange
      const expected = ['us-east-1b','us-east-1c','us-east-1d','us-east-1e'];
      //Act
      let result = await vpcClientService.getAvailabilityZones();
      //Assert
      expect(result).to.deep.equal(expected);
    });

    it('should return an array with only the available zones', async () => {
      //Arrange
      vpcClientService._awsEc2Client.describeAvailabilityZones = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          AvailabilityZones: [
             {
            Messages: [
            ],
            RegionName: "us-east-1",
            State: "available",
            ZoneName: "us-east-1b"
           },
             {
            Messages: [
            ],
            RegionName: "us-east-1",
            State: "some-other-state",
            ZoneName: "us-east-1c"
           }
          ]
         })
      });
      const expected = ['us-east-1b'];
      //Act
      let result = await vpcClientService.getAvailabilityZones();
      //Assert
      expect(result).to.deep.equal(expected);
    });
  });

  describe('createVpcFromConfig', () => {
    let VPC;
    let vpcClientService;
    beforeEach(() => {
      VPC = require('../src/vpcClient');
      vpcClientService = new VPC();
      vpcClientService.getVpcIdFromName = sandbox.stub().resolves('');
      vpcClientService.createVpc = sandbox.stub().resolves({});
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves({});
      vpcClientService.createVpcSubnet = sandbox.stub().resolves({});
      vpcClientService.replaceNetworkAclAssociation = sandbox.stub().resolves({});
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves({});
      vpcClientService.createRouteTable = sandbox.stub().resolves({});
      vpcClientService.addInternetGatewayToRouteTable = sandbox.stub().resolves({});
      vpcClientService.associateSubnetWithRouteTable = sandbox.stub().resolves({});
      vpcClientService.getRouteTableByVpcId = sandbox.stub().resolves({});
      vpcClientService.createOrUpdatePeeringConnection = sandbox.stub().resolves({});
      vpcClientService.getAvailabilityZones = sandbox.stub().resolves(['us-west-2a']);
      vpcClientService.addNATGatewayToRouteTable = sandbox.stub().resolves({});
      vpcClientService.createNATGateway = sandbox.stub().resolves({});
    });

    afterEach(() => {
      VPC = null;
      vpcClientService = null;
    });

    it('should pass config.name to getVpcIdFromName', () => {
      //Arrange
      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };



      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.getVpcIdFromName.args[0][0]).to.be.equal(vpcConfig.name);
      });
    });

    it('should return existingVpcId if vpc already exists', () => {
      //Arrange
      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const existingVpcId = 'vpc-test123';


      //Setting up VPC clients
      vpcClientService.getVpcIdFromName = sandbox.stub().resolves(existingVpcId);


      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(foundVpcId => {
        expect(foundVpcId).to.be.equal(existingVpcId);
      });
    });

    it('should return vpcId to getRouteTableByVpcId if vpc already exists', () => {
      //Arrange
      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const existingVpcId = 'vpc-test123';


      //Setting up VPC clients
      vpcClientService.getVpcIdFromName = sandbox.stub().resolves(existingVpcId);

      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(foundVpcId => {
        expect(vpcClientService.getRouteTableByVpcId.args[0][0]).to.be.equal(existingVpcId);
      });
    });

    it('should pass config.name, environment, and config.cidrBlock to createVpc', () => {
      //Arrange
      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';

      //Setting up VPC clients
      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);

      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {

        expect(vpcClientService.createVpc.args[0][0]).to.be.equal(vpcConfig.name);
        expect(vpcClientService.createVpc.args[0][1]).to.be.equal('environmentTest');
        expect(vpcClientService.createVpc.args[0][2]).to.be.equal(vpcConfig.cidrBlock);
      });
    });

    it('should pass vpcId, name, environment, and rules parameter to createNetworkAclWithRules', () => {
      //Arrange

      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';

      //Setting up VPC clients
      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);



      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {

        expect(vpcClientService.createNetworkAclWithRules.args[0][0]).to.be.equal(newlyCreatedVpcId);
        expect(vpcClientService.createNetworkAclWithRules.args[0][1]).to.be.equal(vpcConfig.networkAcls[0].name);
        expect(vpcClientService.createNetworkAclWithRules.args[0][2]).to.be.equal('environmentTest');
        expect(vpcClientService.createNetworkAclWithRules.args[0][3].length).to.be.equal(vpcConfig.networkAcls[0].rules.length);
      });
    });

    it('should call createNetworkAclWithRules for each networkAcl', () => {
      //Arrange

      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';

      //Setting up VPC clients
      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);




      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createNetworkAclWithRules.callCount).to.be.equal(1);
      });
    });

    it('should pass vpcId, name, environment, cidrBlock, availabileZone, mapPublicIpOnLaunch parameter to createVpcSubnet', () => {
      //Arrange

      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createVpcSubnet.args[0][0]).to.be.equal(newlyCreatedVpcId);
        expect(vpcClientService.createVpcSubnet.args[0][1]).to.be.equal(instanceSubnet1.name);
        expect(vpcClientService.createVpcSubnet.args[0][2]).to.be.equal('environmentTest');
        expect(vpcClientService.createVpcSubnet.args[0][3]).to.be.equal(instanceSubnet1.cidrBlock);
        expect(vpcClientService.createVpcSubnet.args[0][4]).to.be.equal('us-west-2a');
        expect(vpcClientService.createVpcSubnet.args[0][5]).to.be.equal(instanceSubnet1.mapPublicIpOnLaunch);

      });
    });

    it('should pass the availability zones that match the passed in index for each subnet', () => {
      //Arrange

      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const instanceSubnet2 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 2, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const instanceSubnet3 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};

      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1, instanceSubnet2, instanceSubnet3],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';
      const availabilityZones = ['us-west-2a', 'us-west-2b', 'us-west-2z'];
      //Setting up VPC clients
      vpcClientService.getAvailabilityZones = sandbox.stub().resolves(availabilityZones);
      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createVpcSubnet.args[0][4]).to.be.equal('us-west-2a');
        expect(vpcClientService.createVpcSubnet.args[1][4]).to.be.equal('us-west-2b');
        expect(vpcClientService.createVpcSubnet.args[2][4]).to.be.equal('us-west-2a');
      });
    });


    it('should still pass a correct availability zone even if the index is higher than the number of the available zones', () => {
      //Arrange

      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const instanceSubnet2 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 5, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const instanceSubnet3 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};

      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1, instanceSubnet2, instanceSubnet3],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';
      const availabilityZones = ['us-west-2a', 'us-west-2b', 'us-west-2z'];
      //Setting up VPC clients
      vpcClientService.getAvailabilityZones = sandbox.stub().resolves(availabilityZones);
      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);


      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createVpcSubnet.args[0][4]).to.be.equal('us-west-2a');
        expect(vpcClientService.createVpcSubnet.args[1][4]).to.be.equal('us-west-2b');
        expect(vpcClientService.createVpcSubnet.args[2][4]).to.be.equal('us-west-2a');
      });
    });

    it('should pass a correct availability zone if the zone is passed as a string and is active', () => {
      //Arrange

      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const instanceSubnet2 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 2, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const instanceSubnet3 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 'us-west-2z', networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};

      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1, instanceSubnet2, instanceSubnet3],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';
      const availabilityZones = ['us-west-2a', 'us-west-2b', 'us-west-2z'];
      //Setting up VPC clients
      vpcClientService.getAvailabilityZones = sandbox.stub().resolves(availabilityZones);
      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createVpcSubnet.args[0][4]).to.be.equal('us-west-2a');
        expect(vpcClientService.createVpcSubnet.args[1][4]).to.be.equal('us-west-2b');
        expect(vpcClientService.createVpcSubnet.args[2][4]).to.be.equal('us-west-2z');
      });
    });

    it('should throw an error if one of the subnets holds an inactive or incorrect availability zone', () => {
      //Arrange

      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const instanceSubnet2 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 2, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const instanceSubnet3 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 'iam-totally-fake', networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};

      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1, instanceSubnet2, instanceSubnet3],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';
      const availabilityZones = ['us-west-2a', 'us-west-2b', 'us-west-2z'];
      //Setting up VPC clients
      vpcClientService.getAvailabilityZones = sandbox.stub().resolves(availabilityZones);
      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.catch(err => {
        expect(err).to.have.property('message','Subnet availability zone in config is not an active available zone');
      });
    });

    it('should call createVpcSubnet for each subnet', () => {
      //Arrange

      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createVpcSubnet.callCount).to.be.equal(vpcConfig.subnets.length);
      });
    });

    it('should pass networkAclId and subnetId to replaceNetworkAclAssociation', () => {
      //Arrange
      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);


      //Act
      const resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.replaceNetworkAclAssociation.args[0][0]).to.be.equal(createdNetworkAclId);
        expect(vpcClientService.replaceNetworkAclAssociation.args[0][1]).to.be.equal(createdSubnetId);
      });
    });

    it('should call createNATGateway once if subnet.isNAT=true', async () => {
      //Arrange
      const natSubnet1 = {
        name: 'NAT Subnet 1',
        cidrBlock: '10.0.2.0/24',
        availabilityZone: 1,
        networkAclName: 'Instance Network Acl',
        mapPublicIpOnLaunch: true,
        isNAT: true
      };
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [natSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      await vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      expect(vpcClientService.createNATGateway.calledOnce).to.be.true;
    });

    it('should pass vpcId to createNATGateway if subnet.isNAT=true', async () => {
      //Arrange
      const natSubnet1 = {
        name: 'NAT Subnet 1',
        cidrBlock: '10.0.2.0/24',
        availabilityZone: 1,
        networkAclName: 'Instance Network Acl',
        mapPublicIpOnLaunch: true,
        isNAT: true
      };
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [natSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      await vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      expect(vpcClientService.createNATGateway.args[0][0]).to.be.equal(newlyCreatedVpcId);
    });

    it('should pass subnetId to createNATGateway if subnet.isNAT=true', async () => {
      //Arrange
      const natSubnet1 = {
        name: 'NAT Subnet 1',
        cidrBlock: '10.0.2.0/24',
        availabilityZone: 1,
        networkAclName: 'Instance Network Acl',
        mapPublicIpOnLaunch: true,
        isNAT: true
      };
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [natSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      await vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      expect(vpcClientService.createNATGateway.args[0][1]).to.be.equal(createdSubnetId);
    });

    it('should call addInternetGatewayToRouteTable once if subnet.isNAT=true', async () => {
      //Arrange
      const natSubnet1 = {
        name: 'NAT Subnet 1',
        cidrBlock: '10.0.2.0/24',
        availabilityZone: 1,
        networkAclName: 'Instance Network Acl',
        mapPublicIpOnLaunch: true,
        isNAT: true
      };
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [natSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      await vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      expect(vpcClientService.addInternetGatewayToRouteTable.calledOnce).to.be.true;
    });

    it('should call addNATGatewayToRouteTable once if subnet has NATSubnetName associated with it', async () => {
      //Arrange
      const natSubnet1 = {
        name: 'NAT Subnet 1',
        cidrBlock: '10.0.2.0/24',
        availabilityZone: 1,
        networkAclName: 'Instance Network Acl',
        mapPublicIpOnLaunch: true,
        isNAT: true
      };
      const instanceSubnet1 = {
        name: 'Instance Subnet 1',
        cidrBlock: '10.0.2.0/24',
        availabilityZone: 1,
        networkAclName: 'Instance Network Acl',
        mapPublicIpOnLaunch: true,
        NATSubnetName: 'NAT Subnet 1'
      };
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [natSubnet1, instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      await vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      expect(vpcClientService.addNATGatewayToRouteTable.calledOnce).to.be.true;
    });

    it('should pass natGatewayId to addNATGatewayToRouteTable if subnet has NATSubnetName associated with it', async () => {
      //Arrange
      const natSubnet1 = {
        name: 'NAT Subnet 1',
        cidrBlock: '10.0.2.0/24',
        availabilityZone: 1,
        networkAclName: 'Instance Network Acl',
        mapPublicIpOnLaunch: true,
        isNAT: true
      };
      const instanceSubnet1 = {
        name: 'Instance Subnet 1',
        cidrBlock: '10.0.2.0/24',
        availabilityZone: 1,
        networkAclName: 'Instance Network Acl',
        mapPublicIpOnLaunch: true,
        NATSubnetName: 'NAT Subnet 1'
      };
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [natSubnet1, instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';
      const natGatewayId = 'nat-12312321321321312';

      //Setting up VPC clients
      vpcClientService.createNATGateway = sandbox.stub().resolves(natGatewayId);
      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      await vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      expect(vpcClientService.addNATGatewayToRouteTable.args[0][0]).to.be.equal(natGatewayId);
    });

    it('should pass internetGatewayId to addInternetGatewayToRouteTable if subnet.isNAT=true', async () => {
      //Arrange
      const natSubnet1 = {
        name: 'NAT Subnet 1',
        cidrBlock: '10.0.2.0/24',
        availabilityZone: 1,
        networkAclName: 'Instance Network Acl',
        mapPublicIpOnLaunch: true,
        isNAT: true
      };
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [natSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';
      const internetGatewayId = 'igw-1231231';

      //Setting up VPC clients
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(internetGatewayId);
      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);

      //Act
      await vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      expect(vpcClientService.addInternetGatewayToRouteTable.args[0][0]).to.be.equal(internetGatewayId);
    });

    it('should call replaceNetworkAclAssociation for each subnet', () => {
      //Arrange

      const instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      const vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      const newlyCreatedVpcId = 'vpc-test123';
      const createdNetworkAclId = 'acl-123';
      const createdSubnetId = 'subnet-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);


      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.replaceNetworkAclAssociation.callCount).to.be.equal(vpcConfig.subnets.length);
      });
    });

    it('should pass vpcId, name, and environment to createAndAttachInternetGateway', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);

      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createAndAttachInternetGateway.args[0][0]).to.be.equal(newlyCreatedVpcId);
        expect(vpcClientService.createAndAttachInternetGateway.args[0][1]).to.be.equal(`${vpcConfig.name} - Internet Gateway`);
        expect(vpcClientService.createAndAttachInternetGateway.args[0][2]).to.be.equal('environmentTest');
      });
    });

    it('should call createAndAttachInternetGateway once', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);

      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createAndAttachInternetGateway.callCount).to.be.equal(1);
      });
    });

    it('should pass vpcId, name, and environment to createRouteTable', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';
      let createdRouteTableId = 'rtb-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);
      vpcClientService.createRouteTable = sandbox.stub().resolves(createdRouteTableId);

      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createRouteTable.args[0][0]).to.be.equal(newlyCreatedVpcId);
        expect(vpcClientService.createRouteTable.args[0][1]).to.be.equal(`${vpcConfig.name} - Route Table`);
        expect(vpcClientService.createRouteTable.args[0][2]).to.be.equal('environmentTest');
      });
    });

    it('should call createRouteTable once', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';
      let createdRouteTableId = 'rtb-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);
      vpcClientService.createRouteTable = sandbox.stub().resolves(createdRouteTableId);

      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createRouteTable.callCount).to.be.equal(1);
      });
    });

    it('should pass internetGatewayId and routeTableId to addInternetGatewayToRouteTable', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';
      let createdRouteTableId = 'rtb-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);
      vpcClientService.createRouteTable = sandbox.stub().resolves(createdRouteTableId);


      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.addInternetGatewayToRouteTable.args[0][0]).to.be.equal(createdInternetGatewayId);
        expect(vpcClientService.addInternetGatewayToRouteTable.args[0][1]).to.be.equal(createdRouteTableId);
      });
    });

    it('should call addInternetGatewayToRouteTable once', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';
      let createdRouteTableId = 'rtb-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);
      vpcClientService.createRouteTable = sandbox.stub().resolves(createdRouteTableId);


      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.addInternetGatewayToRouteTable.callCount).to.be.equal(1);
      });
    });

    it('should pass routeTableId and subnetId to associateSubnetWithRouteTable', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';
      let createdRouteTableId = 'rtb-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);
      vpcClientService.createRouteTable = sandbox.stub().resolves(createdRouteTableId);


      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.associateSubnetWithRouteTable.args[0][0]).to.be.equal(createdRouteTableId);
        expect(vpcClientService.associateSubnetWithRouteTable.args[0][1]).to.be.equal(createdSubnetId);
      });
    });

    it('should call associateSubnetWithRouteTable for each subnet', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';
      let createdRouteTableId = 'rtb-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);
      vpcClientService.createRouteTable = sandbox.stub().resolves(createdRouteTableId);


      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.associateSubnetWithRouteTable.callCount).to.be.equal(vpcConfig.subnets.length);
      });
    });

    it('should call createOrUpdatePeeringConnection if config contains a peering connection id and destinationCidrBlock', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ],
        peeringConnection: { // obtained from mLab when creating the dedicated database instance
          id: 'sofake',
          destinationCidrBlock: '0.0.0.0/0'
        }
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';
      let createdRouteTableId = 'rtb-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);
      vpcClientService.createRouteTable = sandbox.stub().resolves(createdRouteTableId);




      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createOrUpdatePeeringConnection.callCount).to.be.equal(1);
      });
    });

    it('should NOT call createOrUpdatePeeringConnection if config contains no peering connection id and destinationCidrBlock', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';
      let createdRouteTableId = 'rtb-123abc';

      //Setting up VPC clients
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);
      vpcClientService.createRouteTable = sandbox.stub().resolves(createdRouteTableId);
      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createOrUpdatePeeringConnection.callCount).to.be.equal(0);
      });
    });

    it('should return newly created vpcId', () => {
      //Arrange

      let instanceSubnet1 = { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 1, networkAclName: 'Instance Network Acl', mapPublicIpOnLaunch: true};
      let vpcConfig = {
        name: 'TEST VPC',
        cidrBlock: '10.0.0.0/16',
        subnets: [instanceSubnet1],
        networkAcls: [
          {
            name: 'Instance Network Acl',
            rules: [
              { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
              { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
            ]
          }
        ]
      };

      let newlyCreatedVpcId = 'vpc-test123';
      let createdNetworkAclId = 'acl-123';
      let createdSubnetId = 'subnet-123abc';
      let createdInternetGatewayId = 'igw-abc123test';
      let createdRouteTableId = 'rtb-123abc';

      //Setting up VPC clients

      vpcClientService.createVpc = sandbox.stub().resolves(newlyCreatedVpcId);
      vpcClientService.createNetworkAclWithRules = sandbox.stub().resolves(createdNetworkAclId);
      vpcClientService.createVpcSubnet = sandbox.stub().resolves(createdSubnetId);
      vpcClientService.createAndAttachInternetGateway = sandbox.stub().resolves(createdInternetGatewayId);
      vpcClientService.createRouteTable = sandbox.stub().resolves(createdRouteTableId);

      //Act
      let resultPromise = vpcClientService.createVpcFromConfig('environmentTest', vpcConfig);

      //Assert
      return resultPromise.then(createdVpcId => {
        expect(createdVpcId).to.be.equal(newlyCreatedVpcId);
      });
    });
  });

  describe('createVpc', () => {
    it('should pass cidrBlock to createVpc method', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createVpcResponse);} }),
        waitFor: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };


      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createVpc.args[0][0];

        expect(params).to.have.property('CidrBlock', cidrBlock);
      });
    });

    it('should pass InstanceTenancy=default to createVpc method', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createVpcResponse);
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({});
          }
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };


      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createVpc.args[0][0];

        expect(params).to.have.property('InstanceTenancy', 'default');
      });
    });

    it('should pass DryRun=false to createVpc method', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createVpcResponse);
          }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({});
          }
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };


      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createVpc.args[0][0];

        expect(params).to.have.property('DryRun', false);
      });
    });

    it('should call createVpc once', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({
          promise: () => { return BluebirdPromise.resolve(createVpcResponse); }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({});
          }
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };



      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(() => {
        expect(awsEc2ClientMock.createVpc.calledOnce).to.be.true;
      });
    });

    it('should call waitFor once', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({
          promise: () => { return BluebirdPromise.resolve(createVpcResponse); }
        }),
        waitFor: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve({});
          }
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };


      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(() => {
        expect(awsEc2ClientMock.waitFor.calledOnce).to.be.true;
      });
    });

    it('should pass name parameter to _createTags', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createVpcResponse);} }),
        waitFor: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };


      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(() => {
        let tagParams = vpcClientService._createTags.args[0][1];
        let nameTag = __.filter(tagParams, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Value', name);
      });
    });

    it('should pass environment parameter to _createTags', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createVpcResponse);} }),
        waitFor: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };


      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(() => {
        let tagParams = vpcClientService._createTags.args[0][1];
        let environmentTag = __.filter(tagParams, {Key: 'Environment'});
        expect(environmentTag[0]).to.have.property('Value', environment);
      });
    });

    it('should call _createTags once', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createVpcResponse);} }),
        waitFor: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };


      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService._createTags.calledOnce).to.be.true;
      });
    });

    it('should call _modifyVpcAttributes once and pass enableDnsHostnames=true and enableDnsSupport=true', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createVpcResponse);} }),
        waitFor: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };


      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService._modifyVpcAttributes.calledOnce).to.be.true;
        expect(vpcClientService._modifyVpcAttributes.args[0][0]).to.be.equal(createVpcResponse.Vpc.VpcId);
        expect(vpcClientService._modifyVpcAttributes.args[0][1]).to.be.true;
        expect(vpcClientService._modifyVpcAttributes.args[0][2]).to.be.true;
      });
    });

    it('should return newly created vpcId', () => {
      //Arrange
      let createVpcResponse = {
        Vpc: {
          VpcId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createVpc: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createVpcResponse);} }),
        waitFor: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };


      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._modifyVpcAttributes = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpc(name, environment, cidrBlock);

      //Assert
      return resultPromise.then(createdVpcId => {
        expect(createdVpcId).to.be.equal(createVpcResponse.Vpc.VpcId);
      });
    });
  });

  describe('getVpcIdFromName', () => {
    it('should pass name to describeVpcs method', () => {
      //Arrange

      const vpcName = 'MyVPC';
      let describeVpcsResponse = {
        Vpcs: [
          {
            CidrBlock: "10.0.0.0/16",
            DhcpOptionsId: "dopt-7a8b9c2d",
            InstanceTenancy: "default",
            IsDefault: false,
            State: "available",
            Tags: [
              {
                Key: "Name",
                Value: vpcName
              }
            ],
            VpcId: "vpc-a01106c2"
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeVpcs: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeVpcsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getVpcIdFromName(vpcName);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeVpcs.args[0][0];

        expect(params).to.have.property('Filters');
        let nameFilter = __.filter(params.Filters, {Name: 'tag:Name'});
        expect(nameFilter[0]).to.have.property('Values');
        expect(nameFilter[0].Values).to.be.an('array');
        expect(nameFilter[0].Values.length).to.be.equal(1);
        expect(nameFilter[0].Values[0]).to.be.equal(vpcName);
      });
    });

    it('should pass DryRun=false to describeVpcs method', () => {
      //Arrange

      const vpcName = 'MyVPC';
      let describeVpcsResponse = {
        Vpcs: [
          {
            CidrBlock: "10.0.0.0/16",
            DhcpOptionsId: "dopt-7a8b9c2d",
            InstanceTenancy: "default",
            IsDefault: false,
            State: "available",
            Tags: [
              {
                Key: "Name",
                Value: vpcName
              }
            ],
            VpcId: "vpc-a01106c2"
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeVpcs: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeVpcsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getVpcIdFromName(vpcName);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeVpcs.args[0][0];

        expect(params).to.have.property('DryRun', false);
      });
    });

    it('should return vpcId if vpc is returned', () => {
      //Arrange

      const vpcName = 'MyVPC';
      let describeVpcsResponse = {
        Vpcs: [
          {
            CidrBlock: "10.0.0.0/16",
            DhcpOptionsId: "dopt-7a8b9c2d",
            InstanceTenancy: "default",
            IsDefault: false,
            State: "available",
            Tags: [
              {
                Key: "Name",
                Value: vpcName
              }
            ],
            VpcId: "vpc-a01106c2"
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeVpcs: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeVpcsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getVpcIdFromName(vpcName);

      //Assert
      return resultPromise.then(foundVpcId => {

        expect(foundVpcId).to.be.equal(describeVpcsResponse.Vpcs[0].VpcId);
      });
    });

    it('should return empty string if no vpc is found', () => {
      //Arrange

      const vpcName = 'MyVPC';
      let describeVpcsResponse = {
        Vpcs: [ ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeVpcs: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeVpcsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getVpcIdFromName(vpcName);

      //Assert
      return resultPromise.then(foundVpcId => {

        expect(foundVpcId).to.be.equal('');
      });
    });
  });

  describe('getRouteTableByVpcId', () => {
    it('should pass vpcId to describeRouteTables method', () => {
      //Arrange

      const vpcId = 'MyVPC';
      let describeVpcsResponse = {
        RouteTables: ['a']
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeRouteTables: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeVpcsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getRouteTableByVpcId(vpcId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeRouteTables.args[0][0];

        expect(params).to.have.property('Filters');
        expect(params.Filters).to.be.an('array');
        expect(params.Filters[0]).to.have.property('Values');
        expect(params.Filters[0].Name).to.be.equal('vpc-id');
        expect(params.Filters[0].Values).to.be.an('array');
        expect(params.Filters[0].Values.length).to.be.equal(1);
        expect(params.Filters[0].Values[0]).to.be.equal(vpcId);
      });
    });

    it('should pass DryRun=false to describeRouteTables method', () => {
      //Arrange

      const vpcName = 'MyVPC';
      let describeVpcsResponse = {
        Vpcs: [
          {
            CidrBlock: "10.0.0.0/16",
            DhcpOptionsId: "dopt-7a8b9c2d",
            InstanceTenancy: "default",
            IsDefault: false,
            State: "available",
            Tags: [
              {
                Key: "Name",
                Value: vpcName
              }
            ],
            VpcId: "vpc-a01106c2"
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeVpcs: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeVpcsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getVpcIdFromName(vpcName);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeVpcs.args[0][0];

        expect(params).to.have.property('DryRun', false);
      });
    });

    it('should return routeTableId if routeTable is found', () => {
      //Arrange

      const vpcName = 'MyVPC';
      let describeVpcsResponse = {
        Vpcs: [
          {
            CidrBlock: "10.0.0.0/16",
            DhcpOptionsId: "dopt-7a8b9c2d",
            InstanceTenancy: "default",
            IsDefault: false,
            State: "available",
            Tags: [
              {
                Key: "Name",
                Value: vpcName
              }
            ],
            VpcId: "vpc-a01106c2"
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeVpcs: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeVpcsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getVpcIdFromName(vpcName);

      //Assert
      return resultPromise.then(foundVpcId => {

        expect(foundVpcId).to.be.equal(describeVpcsResponse.Vpcs[0].VpcId);
      });
    });

    it('should return empty string if no routeTable is found', () => {
      //Arrange

      const vpcName = 'MyVPC';
      let describeVpcsResponse = {
        Vpcs: [ ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeVpcs: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeVpcsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getVpcIdFromName(vpcName);

      //Assert
      return resultPromise.then(foundVpcId => {

        expect(foundVpcId).to.be.equal('');
      });
    });
  });

  describe('getSubnetIdsFromSubnetName', () => {
    it('should pass array of subnetNames to describeSubnets method', () => {
      //Arrange

      const vpcId = 'vpc-123abc';
      const subnet1Name = 'subnet1';
      const subnet2Name = 'subnet2';
      let describeSubnetsResponse = {
        Subnets: [
          {
            AvailabilityZone: 1,
            AvailableIpAddressCount: 251,
            CidrBlock: "10.0.1.0/24",
            DefaultForAz: false,
            MapPublicIpOnLaunch: false,
            State: "available",
            SubnetId: "subnet-9d4a7b6c",
            VpcId: vpcId,
            Tags: [
              {Key: 'Name', Value: subnet1Name}
            ]
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSubnets: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSubnetsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getSubnetIdsFromSubnetName(vpcId, [subnet1Name, subnet2Name]);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeSubnets.args[0][0];

        expect(params).to.have.property('Filters');
        let nameFilter = __.filter(params.Filters, {Name: 'tag:Name'});
        expect(nameFilter[0]).to.have.property('Values');
        expect(nameFilter[0].Values).to.be.an('array');
        expect(nameFilter[0].Values.length).to.be.equal(2);
      });
    });

    it('should pass vpcId to describeSubnets method', () => {
      //Arrange

      const vpcId = 'vpc-123abc';
      const subnet1Name = 'subnet1';
      let describeSubnetsResponse = {
        Subnets: [
          {
            AvailabilityZone: 1,
            AvailableIpAddressCount: 251,
            CidrBlock: "10.0.1.0/24",
            DefaultForAz: false,
            MapPublicIpOnLaunch: false,
            State: "available",
            SubnetId: "subnet-9d4a7b6c",
            VpcId: vpcId,
            Tags: [
              {Key: 'Name', Value: subnet1Name}
            ]
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSubnets: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSubnetsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getSubnetIdsFromSubnetName(vpcId, [subnet1Name]);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeSubnets.args[0][0];

        expect(params).to.have.property('Filters');
        let vpcFilter = __.filter(params.Filters, {Name: 'vpc-id'});
        expect(vpcFilter[0]).to.have.property('Values');
        expect(vpcFilter[0].Values).to.be.an('array');
        expect(vpcFilter[0].Values.length).to.be.equal(1);
        expect(vpcFilter[0].Values[0]).to.be.equal(vpcId);
      });
    });

    it('should pass DryRun=false to describeSubnets method', () => {
      //Arrange

      const vpcId = 'vpc-123abc';
      const subnet1Name = 'subnet1';
      let describeSubnetsResponse = {
        Subnets: [
          {
            AvailabilityZone: 1,
            AvailableIpAddressCount: 251,
            CidrBlock: "10.0.1.0/24",
            DefaultForAz: false,
            MapPublicIpOnLaunch: false,
            State: "available",
            SubnetId: "subnet-9d4a7b6c",
            VpcId: vpcId,
            Tags: [
              {Key: 'Name', Value: subnet1Name}
            ]
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSubnets: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSubnetsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getSubnetIdsFromSubnetName(vpcId, [subnet1Name]);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeSubnets.args[0][0];

        expect(params).to.have.property('DryRun', false);
      });
    });

    it('should convert subnetName into an array of subnets', () => {
      //Arrange

      const vpcId = 'vpc-123abc';
      const subnet1Name = 'subnet1';
      let describeSubnetsResponse = {
        Subnets: [
          {
            AvailabilityZone: 1,
            AvailableIpAddressCount: 251,
            CidrBlock: "10.0.1.0/24",
            DefaultForAz: false,
            MapPublicIpOnLaunch: false,
            State: "available",
            SubnetId: "subnet-9d4a7b6c",
            VpcId: vpcId,
            Tags: [
              {Key: 'Name', Value: subnet1Name}
            ]
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSubnets: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSubnetsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getSubnetIdsFromSubnetName(vpcId, subnet1Name);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeSubnets.args[0][0];

        expect(params).to.have.property('Filters');
        let nameFilter = __.filter(params.Filters, {Name: 'tag:Name'});
        expect(nameFilter[0]).to.have.property('Values');
        expect(nameFilter[0].Values).to.be.an('array');
        expect(nameFilter[0].Values.length).to.be.equal(1);
        expect(nameFilter[0].Values[0]).to.be.equal(subnet1Name);

      });
    });

    it('should parse a single subnet and return an array of 1 subnetId', () => {
      //Arrange

      const vpcId = 'vpc-123abc';
      const subnet1Name = 'subnet1';
      let describeSubnetsResponse = {
        Subnets: [
          {
            AvailabilityZone: 1,
            AvailableIpAddressCount: 251,
            CidrBlock: "10.0.1.0/24",
            DefaultForAz: false,
            MapPublicIpOnLaunch: false,
            State: "available",
            SubnetId: "subnet-9d4a7b6c",
            VpcId: vpcId,
            Tags: [
              {Key: 'Name', Value: subnet1Name}
            ]
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSubnets: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSubnetsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getSubnetIdsFromSubnetName(vpcId, subnet1Name);

      //Assert
      return resultPromise.then(subnetIds => {
        expect(subnetIds).to.be.an('array');
        expect(subnetIds.length).to.be.equal(1);
        expect(subnetIds[0]).to.be.equal('subnet-9d4a7b6c');

      });
    });

    it('should parse multiple subnets and return an array of multiple subnetIds', () => {
      //Arrange

      const vpcId = 'vpc-123abc';
      const subnet1Name = 'subnet1';
      let describeSubnetsResponse = {
        Subnets: [
          {
            AvailabilityZone: 1,
            AvailableIpAddressCount: 251,
            CidrBlock: "10.0.1.0/24",
            DefaultForAz: false,
            MapPublicIpOnLaunch: false,
            State: "available",
            SubnetId: "subnet-9d4a7b6c",
            VpcId: vpcId,
            Tags: [
              {Key: 'Name', Value: subnet1Name}
            ]
          },
          {
            AvailabilityZone: 1,
            AvailableIpAddressCount: 251,
            CidrBlock: "10.0.2.0/24",
            DefaultForAz: false,
            MapPublicIpOnLaunch: false,
            State: "available",
            SubnetId: "subnet-9d4a7b6d",
            VpcId: vpcId,
            Tags: [
              {Key: 'Name', Value: subnet1Name}
            ]
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSubnets: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSubnetsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getSubnetIdsFromSubnetName(vpcId, subnet1Name);

      //Assert
      return resultPromise.then(subnetIds => {
        expect(subnetIds).to.be.an('array');
        expect(subnetIds.length).to.be.equal(2);
      });
    });

    it('should return an empty array if no subnets returned', () => {
      //Arrange

      const vpcId = 'vpc-123abc';
      const subnet1Name = 'subnet1';
      let describeSubnetsResponse = {
        Subnets: []
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeSubnets: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeSubnetsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.getSubnetIdsFromSubnetName(vpcId, subnet1Name);

      //Assert
      return resultPromise.then(subnetIds => {
        expect(subnetIds).to.be.an('array');
        expect(subnetIds.length).to.be.equal(0);
      });
    });
  });

  describe('createVpcSubnet', () => {
    it('should pass vpcId to createSubnet method', () => {
      //Arrange
      let createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createSubnet.args[0][0];

        expect(params).to.have.property('VpcId', vpcId);
      });
    });

    it('should pass availabilityZone to createSubnet method', () => {
      //Arrange
      let createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createSubnet.args[0][0];

        expect(params).to.have.property('AvailabilityZone', availabilityZone);
      });
    });

    it('should pass cidrBlock to createSubnet method', () => {
      //Arrange
      let createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createSubnet.args[0][0];

        expect(params).to.have.property('CidrBlock', cidrBlock);
      });
    });

    it('should pass DryRun=false to createSubnet method', () => {
      //Arrange
      let createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createSubnet.args[0][0];

        expect(params).to.have.property('DryRun', false);
      });
    });

    it('should call createSubnet once', () => {
      //Arrange
      let createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        expect(awsEc2ClientMock.createSubnet.calledOnce).to.be.true;
      });
    });

    it('should pass name parameter to _createTags', () => {
      //Arrange
      const createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      const awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      const resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        const tagParams = vpcClientService._createTags.args[0][1];
        const nameTag = __.filter(tagParams, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Value', name);
      });
    });

    it('should pass environment parameter to _createTags', () => {
      //Arrange
      let createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      const resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        let tagParams = vpcClientService._createTags.args[0][1];
        let environmentTag = __.filter(tagParams, {Key: 'Environment'});
        expect(environmentTag[0]).to.have.property('Value', environment);
      });
    });

    it('should call _createTags once', () => {
      //Arrange
      let createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      const awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      const resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService._createTags.calledOnce).to.be.true;
      });
    });

    it('should pass newly created subnetId to _setMapPublicIpOnLaunchAttribute', () => {
      //Arrange
      const createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      const awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      const resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        let subnetParam = vpcClientService._setMapPublicIpOnLaunchAttribute.args[0][0];

        expect(subnetParam).to.be.equal(createSubnetResponse.Subnet.SubnetId);
      });
    });

    it('should pass mapPublicIpOnLaunch to _setMapPublicIpOnLaunchAttribute', () => {
      //Arrange
      let createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      const resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        let flagParam = vpcClientService._setMapPublicIpOnLaunchAttribute.args[0][1];

        expect(flagParam).to.be.equal(mapPublicIpOnLaunch);
      });
    });

    it('should call _setMapPublicIpOnLaunchAttribute once', () => {
      //Arrange
      const createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      const awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      const resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService._setMapPublicIpOnLaunchAttribute.calledOnce).to.be.true;
      });
    });

    it('should return newly created subnetId', () => {
      //Arrange
      let createSubnetResponse = {
        Subnet: {
          SubnetId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createSubnet: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createSubnetResponse);} }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const cidrBlock = '10.0.0.0/16';
      const availabilityZone = 'us-west-2a';
      const mapPublicIpOnLaunch = false;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService._setMapPublicIpOnLaunchAttribute = sandbox.stub().resolves({});


      //Act
      const resultPromise = vpcClientService.createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch);

      //Assert
      return resultPromise.then(createdSubnetId => {
        expect(createdSubnetId).to.be.equal(createSubnetResponse.Subnet.SubnetId);
      });
    });
  });

  describe('createAndAttachInternetGateway', () => {

    it('should call createInternetGateway once', () => {
      //Arrange
      const createRouteTableResponse = {
        InternetGateway: {
          InternetGatewayId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      const awsEc2ClientMock = {
        createInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} }),
        attachInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createAndAttachInternetGateway(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        expect(awsEc2ClientMock.createInternetGateway.calledOnce).to.be.true;
      });
    });

    it('should pass name to _createTags', () => {
      //Arrange
      let createRouteTableResponse = {
        InternetGateway: {
          InternetGatewayId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} }),
        attachInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createAndAttachInternetGateway(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        let tagParams = vpcClientService._createTags.args[0][1];
        let nameTag = __.filter(tagParams, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Value', name);
      });
    });

    it('should pass environment to _createTags', () => {
      //Arrange
      let createRouteTableResponse = {
        InternetGateway: {
          InternetGatewayId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} }),
        attachInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createAndAttachInternetGateway(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        let tagParams = vpcClientService._createTags.args[0][1];
        let environmentTag = __.filter(tagParams, {Key: 'Environment'});
        expect(environmentTag[0]).to.have.property('Value', environment);
      });
    });

    it('should call _createTags once', () => {
      //Arrange
      let createRouteTableResponse = {
        InternetGateway: {
          InternetGatewayId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} }),
        attachInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createAndAttachInternetGateway(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService._createTags.calledOnce).to.be.true;
      });
    });

    it('should pass vpcId to attachInternetGateway', () => {
      //Arrange
      let createRouteTableResponse = {
        InternetGateway: {
          InternetGatewayId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} }),
        attachInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createAndAttachInternetGateway(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.attachInternetGateway.args[0][0];

        expect(params).to.have.property('VpcId', vpcId);
      });
    });

    it('should pass newly created InternetGatewayId to attachInternetGateway', () => {
      //Arrange
      let createRouteTableResponse = {
        InternetGateway: {
          InternetGatewayId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} }),
        attachInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createAndAttachInternetGateway(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.attachInternetGateway.args[0][0];

        expect(params).to.have.property('InternetGatewayId', createRouteTableResponse.InternetGateway.InternetGatewayId);
      });
    });

    it('should call attachInternetGateway once', () => {
      //Arrange
      let createRouteTableResponse = {
        InternetGateway: {
          InternetGatewayId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} }),
        attachInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createAndAttachInternetGateway(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        expect(awsEc2ClientMock.attachInternetGateway.calledOnce).to.be.true;
      });
    });

    it('should return created Internet GatewayId', () => {
      //Arrange
      let createRouteTableResponse = {
        InternetGateway: {
          InternetGatewayId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} }),
        attachInternetGateway: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve({});} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createAndAttachInternetGateway(vpcId, name, environment);

      //Assert
      return resultPromise.then(createdInternetGatewayId => {
        expect(createdInternetGatewayId).to.be.equal(createRouteTableResponse.InternetGateway.InternetGatewayId);
      });
    });
  });

  describe('createRouteTable', () => {
    it('should pass vpcId to createRouteTable method', () => {
      //Arrange
      let createRouteTableResponse = {
        RouteTable: {
          RouteTableId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRouteTable: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createRouteTable(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createRouteTable.args[0][0];

        expect(params).to.have.property('VpcId', vpcId);
      });
    });

    it('should pass name parameter to _createTags', () => {
      //Arrange
      let createRouteTableResponse = {
        RouteTable: {
          RouteTableId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRouteTable: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createRouteTable(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        let tagParams = vpcClientService._createTags.args[0][1];
        let nameTag = __.filter(tagParams, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Value', name);
      });
    });

    it('should pass environment parameter to _createTags', () => {
      //Arrange
      let createRouteTableResponse = {
        RouteTable: {
          RouteTableId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRouteTable: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createRouteTable(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        let tagParams = vpcClientService._createTags.args[0][1];
        let environmentTag = __.filter(tagParams, {Key: 'Environment'});
        expect(environmentTag[0]).to.have.property('Value', environment);
      });
    });

    it('should call _createTags once', () => {
      //Arrange
      let createRouteTableResponse = {
        RouteTable: {
          RouteTableId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRouteTable: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createRouteTable(vpcId, name, environment);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService._createTags.calledOnce).to.be.true;
      });
    });

    it('should return created networkAclId', () => {
      //Arrange
      let createRouteTableResponse = {
        RouteTable: {
          RouteTableId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRouteTable: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteTableResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createRouteTable(vpcId, name, environment);

      //Assert
      return resultPromise.then(createdRouteTableId => {
        expect(createdRouteTableId).to.be.equal(createRouteTableResponse.RouteTable.RouteTableId);
      });
    });
  });

  describe('addInternetGatewayToRouteTable', () => {
    it('should pass internetGatewayId to createRoute method', () => {
      //Arrange
      let createRouteResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRoute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const internetGatewayId = 'igw-abc123';
      const routeTableId = 'rt-123';


      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.addInternetGatewayToRouteTable(internetGatewayId, routeTableId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createRoute.args[0][0];

        expect(params).to.have.property('GatewayId', internetGatewayId);
      });
    });

    it('should pass routeTableId to createRoute method', () => {
      //Arrange
      let createRouteResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRoute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const internetGatewayId = 'igw-abc123';
      const routeTableId = 'rt-123';


      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.addInternetGatewayToRouteTable(internetGatewayId, routeTableId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createRoute.args[0][0];

        expect(params).to.have.property('RouteTableId', routeTableId);
      });
    });

    it('should pass DestinationCidrBlock=0.0.0.0/0 to createRoute method', () => {
      //Arrange
      let createRouteResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRoute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const internetGatewayId = 'igw-abc123';
      const routeTableId = 'rt-123';


      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.addInternetGatewayToRouteTable(internetGatewayId, routeTableId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createRoute.args[0][0];

        expect(params).to.have.property('DestinationCidrBlock', '0.0.0.0/0');
      });
    });
  });

  describe('associateSubnetWithRouteTable', () => {
    it('should pass routeTableId to associateRouteTable', () => {
      //Arrange
      let associateRouteTableResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        associateRouteTable: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(associateRouteTableResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const routeTableId = 'rt-123';
      const subnetId = 'subnet-123abc';


      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.associateSubnetWithRouteTable(routeTableId, subnetId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.associateRouteTable.args[0][0];

        expect(params).to.have.property('RouteTableId', routeTableId);
      });
    });

    it('should pass subnetId to associateRouteTable', () => {
      //Arrange
      let associateRouteTableResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        associateRouteTable: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(associateRouteTableResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const routeTableId = 'rt-123';
      const subnetId = 'subnet-123abc';


      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.associateSubnetWithRouteTable(routeTableId, subnetId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.associateRouteTable.args[0][0];

        expect(params).to.have.property('SubnetId', subnetId);
      });
    });

    it('should pass DryRun=false to associateRouteTable', () => {
      //Arrange
      let associateRouteTableResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        associateRouteTable: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(associateRouteTableResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const routeTableId = 'rt-123';
      const subnetId = 'subnet-123abc';


      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.associateSubnetWithRouteTable(routeTableId, subnetId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.associateRouteTable.args[0][0];

        expect(params).to.have.property('DryRun', false);
      });
    });
  });

  describe('createNetworkAclWithRules', () => {

    it('should pass vpcId to createNetworkAcl', () => {
      //Arrange
      let createNetworkAclResponse = {
        NetworkAcl: {
          NetworkAclId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAcl: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const networkAclRules = [];


      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createNetworkAclWithRules(vpcId, name, environment, networkAclRules);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createNetworkAcl.args[0][0];

        expect(params).to.have.property('VpcId', vpcId);
      });
    });

    it('should pass name parameter to _createTags', () => {
      //Arrange
      let createNetworkAclResponse = {
        NetworkAcl: {
          NetworkAclId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAcl: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const networkAclRules = [];
      const singleRule = {
        networkAclId: 'acl-abc123',
        cidrBlock: '0.0.0.0/0',
        egress: false,
        protocol: 'TCP',
        ruleAction: 'ALLOW',
        ruleNumber: 100
      };
      networkAclRules.push(singleRule);

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService.createNetworkAclRule = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createNetworkAclWithRules(vpcId, name, environment, networkAclRules);

      //Assert
      return resultPromise.then(() => {
        let tagParams = vpcClientService._createTags.args[0][1];
        let nameTag = __.filter(tagParams, {Key: 'Name'});
        expect(nameTag[0]).to.have.property('Value', name);
      });
    });

    it('should pass environment parameter to _createTags', () => {
      //Arrange
      let createNetworkAclResponse = {
        NetworkAcl: {
          NetworkAclId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAcl: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const networkAclRules = [];
      const singleRule = {
        networkAclId: 'acl-abc123',
        cidrBlock: '0.0.0.0/0',
        egress: false,
        protocol: 'TCP',
        ruleAction: 'ALLOW',
        ruleNumber: 100
      };
      networkAclRules.push(singleRule);

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService.createNetworkAclRule = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createNetworkAclWithRules(vpcId, name, environment, networkAclRules);

      //Assert
      return resultPromise.then(() => {
        let tagParams = vpcClientService._createTags.args[0][1];
        let environmentTag = __.filter(tagParams, {Key: 'Environment'});
        expect(environmentTag[0]).to.have.property('Value', environment);
      });
    });

    it('should call _createTags once', () => {
      //Arrange
      let createNetworkAclResponse = {
        NetworkAcl: {
          NetworkAclId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAcl: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const networkAclRules = [];
      const singleRule = {
        networkAclId: 'acl-abc123',
        cidrBlock: '0.0.0.0/0',
        egress: false,
        protocol: 'TCP',
        ruleAction: 'ALLOW',
        ruleNumber: 100
      };
      networkAclRules.push(singleRule);

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService.createNetworkAclRule = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createNetworkAclWithRules(vpcId, name, environment, networkAclRules);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService._createTags.calledOnce).to.be.true;
      });
    });

    it('should call createNetworkAclRule for each rule passed in', () => {
      //Arrange
      let createNetworkAclResponse = {
        NetworkAcl: {
          NetworkAclId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAcl: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const networkAclRules = [];
      const singleRule = {
        networkAclId: 'acl-abc123',
        cidrBlock: '0.0.0.0/0',
        egress: false,
        protocol: 'TCP',
        ruleAction: 'ALLOW',
        ruleNumber: 100
      };
      networkAclRules.push(singleRule);
      networkAclRules.push(singleRule);

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService.createNetworkAclRule = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createNetworkAclWithRules(vpcId, name, environment, networkAclRules);

      //Assert
      return resultPromise.then(() => {
        expect(vpcClientService.createNetworkAclRule.callCount).to.be.equal(networkAclRules.length);
      });
    });

    it('should return created networkAclId', () => {
      //Arrange
      let createNetworkAclResponse = {
        NetworkAcl: {
          NetworkAclId: 'newlyCreatedId'
        }
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAcl: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const vpcId = 'vpc-123abc';
      const name = 'newNameTest';
      const environment = 'newEnvironmentTest';
      const networkAclRules = [];
      const singleRule = {
        networkAclId: 'acl-abc123',
        cidrBlock: '0.0.0.0/0',
        egress: false,
        protocol: 'TCP',
        ruleAction: 'ALLOW',
        ruleNumber: 100
      };
      networkAclRules.push(singleRule);
      networkAclRules.push(singleRule);

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._createTags = sandbox.stub().resolves({});
      vpcClientService.createNetworkAclRule = sandbox.stub().resolves({});


      //Act
      let resultPromise = vpcClientService.createNetworkAclWithRules(vpcId, name, environment, networkAclRules);

      //Assert
      return resultPromise.then(createdNetworkAclId => {
        expect(createdNetworkAclId).to.be.equal(createNetworkAclResponse.NetworkAcl.NetworkAclId);
      });
    });

  });

  describe('createNetworkAclRule', () => {
    it('should pass networkAclId to createNetworkAclEntry', () => {
      //Arrange
      let createNetworkAclEntryResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAclEntry: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclEntryResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const cidrBlock = '0.0.0.0/0';
      const egress = false;
      const protocol = 'TCP';
      const ruleAction = 'ALLOW';
      const ruleNumber = 100;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.createNetworkAclRule(networkAclId, cidrBlock, egress, protocol, ruleAction, ruleNumber);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createNetworkAclEntry.args[0][0];

        expect(params).to.have.property('NetworkAclId', networkAclId);
      });
    });

    it('should pass cidrBlock to createNetworkAclEntry', () => {
      //Arrange
      let createNetworkAclEntryResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAclEntry: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclEntryResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const cidrBlock = '0.0.0.0/0';
      const egress = false;
      const protocol = 'TCP';
      const ruleAction = 'ALLOW';
      const ruleNumber = 100;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.createNetworkAclRule(networkAclId, cidrBlock, egress, protocol, ruleAction, ruleNumber);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createNetworkAclEntry.args[0][0];

        expect(params).to.have.property('CidrBlock', cidrBlock);
      });
    });

    it('should pass egress to createNetworkAclEntry', () => {
      //Arrange
      let createNetworkAclEntryResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAclEntry: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclEntryResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const cidrBlock = '0.0.0.0/0';
      const egress = false;
      const protocol = 'TCP';
      const ruleAction = 'ALLOW';
      const ruleNumber = 100;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.createNetworkAclRule(networkAclId, cidrBlock, egress, protocol, ruleAction, ruleNumber);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createNetworkAclEntry.args[0][0];

        expect(params).to.have.property('Egress', egress);
      });
    });

    it('should pass protocol to createNetworkAclEntry', () => {
      //Arrange
      let createNetworkAclEntryResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAclEntry: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclEntryResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const cidrBlock = '0.0.0.0/0';
      const egress = false;
      const protocol = 'TCP';
      const ruleAction = 'ALLOW';
      const ruleNumber = 100;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.createNetworkAclRule(networkAclId, cidrBlock, egress, protocol, ruleAction, ruleNumber);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createNetworkAclEntry.args[0][0];

        expect(params).to.have.property('Protocol', protocol);
      });
    });

    it('should pass ruleAction to createNetworkAclEntry', () => {
      //Arrange
      let createNetworkAclEntryResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAclEntry: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclEntryResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const cidrBlock = '0.0.0.0/0';
      const egress = false;
      const protocol = 'TCP';
      const ruleAction = 'ALLOW';
      const ruleNumber = 100;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.createNetworkAclRule(networkAclId, cidrBlock, egress, protocol, ruleAction, ruleNumber);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createNetworkAclEntry.args[0][0];

        expect(params).to.have.property('RuleAction', ruleAction);
      });
    });

    it('should pass ruleNumber to createNetworkAclEntry', () => {
      //Arrange
      let createNetworkAclEntryResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAclEntry: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclEntryResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const cidrBlock = '0.0.0.0/0';
      const egress = false;
      const protocol = 'TCP';
      const ruleAction = 'ALLOW';
      const ruleNumber = 100;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.createNetworkAclRule(networkAclId, cidrBlock, egress, protocol, ruleAction, ruleNumber);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createNetworkAclEntry.args[0][0];

        expect(params).to.have.property('RuleNumber', ruleNumber);
      });
    });

    it('should pass DryRun=false to createNetworkAclEntry', () => {
      //Arrange
      let createNetworkAclEntryResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAclEntry: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclEntryResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const cidrBlock = '0.0.0.0/0';
      const egress = false;
      const protocol = 'TCP';
      const ruleAction = 'ALLOW';
      const ruleNumber = 100;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.createNetworkAclRule(networkAclId, cidrBlock, egress, protocol, ruleAction, ruleNumber);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createNetworkAclEntry.args[0][0];

        expect(params).to.have.property('DryRun', false);
      });
    });

    it('should pass PortRange (0 to 0) to createNetworkAclEntry', () => {
      //Arrange
      let createNetworkAclEntryResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createNetworkAclEntry: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createNetworkAclEntryResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const cidrBlock = '0.0.0.0/0';
      const egress = false;
      const protocol = 'TCP';
      const ruleAction = 'ALLOW';
      const ruleNumber = 100;

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService.createNetworkAclRule(networkAclId, cidrBlock, egress, protocol, ruleAction, ruleNumber);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createNetworkAclEntry.args[0][0];

        expect(params).to.have.property('PortRange');
        expect(params.PortRange).to.have.property('From', 0);
        expect(params.PortRange).to.have.property('To', 0);
      });
    });
  });

  describe('replaceNetworkAclAssociation', () => {
    it('should pass NetworkAclAssociationId associated with given subnetId to replaceNetworkAclAssociation', () => {
      //Arrange
      let replaceNetworkAclAssociationResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        replaceNetworkAclAssociation: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(replaceNetworkAclAssociationResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const subnetId = 'subnet-abc123';
      const networkAclAssociationId = 'aclassoc-abc123';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._findCurrentNetworkAclAssociationIdForSubnetId = sandbox.stub().withArgs(subnetId).resolves(networkAclAssociationId);


      //Act
      let resultPromise = vpcClientService.replaceNetworkAclAssociation(networkAclId, subnetId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.replaceNetworkAclAssociation.args[0][0];

        expect(params).to.have.property('DryRun', false);
        expect(params).to.have.property('AssociationId', networkAclAssociationId);

      });
    });

    it('should pass given networkAclId to replaceNetworkAclAssociation', () => {
      //Arrange
      let replaceNetworkAclAssociationResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        replaceNetworkAclAssociation: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(replaceNetworkAclAssociationResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const networkAclId = 'acl-abc123';
      const subnetId = 'subnet-abc123';
      const networkAclAssociationId = 'aclassoc-abc123';

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();
      vpcClientService._findCurrentNetworkAclAssociationIdForSubnetId = sandbox.stub().withArgs(subnetId).resolves(networkAclAssociationId);


      //Act
      let resultPromise = vpcClientService.replaceNetworkAclAssociation(networkAclId, subnetId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.replaceNetworkAclAssociation.args[0][0];

        expect(params).to.have.property('DryRun', false);
        expect(params).to.have.property('NetworkAclId', networkAclId);

      });
    });
  });

  describe('_findCurrentNetworkAclAssociationIdForSubnetId', () => {
    it('should pass subnetId to describeNetworkAcls', () => {
      //Arrange
      let describeNetworkAclsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeNetworkAcls: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeNetworkAclsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const subnetId = 'subnet-abc123';

      //Act
      let resultPromise = vpcClientService._findCurrentNetworkAclAssociationIdForSubnetId(subnetId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeNetworkAcls.args[0][0];

        expect(params).to.have.property('DryRun', false);
        expect(params.Filters[0]).to.have.property('Name', 'association.subnet-id');
        expect(params.Filters[0]).to.have.property('Values');
        expect(params.Filters[0].Values[0]).to.be.equal(subnetId);
      });
    });

    it('should return NetworkAclAssociationId from response object that matches the subnetId', () => {
      //Arrange
      const subnetId = 'subnet-abc123';
      const networkAssociationId = 'aclassoc-66ea5f0b';
      const describeNetworkAclsResponse = {
        NetworkAcls: [
          {
            Associations: [
              {
                NetworkAclAssociationId: networkAssociationId,
                NetworkAclId: "acl-9aeb5ef7",
                SubnetId: subnetId
              }
            ]
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeNetworkAcls: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeNetworkAclsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService._findCurrentNetworkAclAssociationIdForSubnetId(subnetId);

      //Assert
      return resultPromise.then(expectedValue => {
        expect(expectedValue).to.be.equal(networkAssociationId);
      });
    });

    it('should return empty string if no association matches the subnetId', () => {
      //Arrange
      const subnetId = 'subnet-abc123';
      const networkAssociationId = 'aclassoc-66ea5f0b';
      const describeNetworkAclsResponse = {
        NetworkAcls: [
          {
            Associations: [
              {
                NetworkAclAssociationId: networkAssociationId,
                NetworkAclId: "acl-9aeb5ef7",
                SubnetId: subnetId
              }
            ]
          }
        ]
      };

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeNetworkAcls: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeNetworkAclsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      //Act
      let resultPromise = vpcClientService._findCurrentNetworkAclAssociationIdForSubnetId('subnet-invalid');

      //Assert
      return resultPromise.then(expectedValue => {
        expect(expectedValue).to.be.equal('');
      });
    });
  });

  describe('_setMapPublicIpOnLaunchAttribute', () => {
    it('should pass subnetId to modifySubnetAttribute', () => {
      //Arrange

      let modifySubnetAttributeResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        modifySubnetAttribute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(modifySubnetAttributeResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const subnetId = 'subnet-abc123';

      //Act
      let resultPromise = vpcClientService._setMapPublicIpOnLaunchAttribute(subnetId, true);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.modifySubnetAttribute.args[0][0];

        expect(params).to.have.property('SubnetId', subnetId);
      });
    });

    it('should pass given value for MapPublicIpOnLaunch to modifySubnetAttribute', () => {
      //Arrange

      let modifySubnetAttributeResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        modifySubnetAttribute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(modifySubnetAttributeResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const subnetId = 'subnet-abc123';

      //Act
      let resultPromise = vpcClientService._setMapPublicIpOnLaunchAttribute(subnetId, false);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.modifySubnetAttribute.args[0][0];

        expect(params.MapPublicIpOnLaunch).to.have.property('Value', false);
      });
    });
  });

  describe('_modifyVpcAttributes', () => {
    it('should pass vpcId to each call of modifyVpcAttribute', () => {
      //Arrange
      let modifyVpcAttributeResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        modifyVpcAttribute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(modifyVpcAttributeResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const vpcId = 'vpc-abc123';

      //Act
      let resultPromise = vpcClientService._modifyVpcAttributes(vpcId, true, true);

      //Assert
      return resultPromise.then(() => {
        let call1Params = awsEc2ClientMock.modifyVpcAttribute.args[0];
        let call2Params = awsEc2ClientMock.modifyVpcAttribute.args[1];

        expect(call1Params[0]).to.have.property('VpcId', vpcId);
        expect(call2Params[0]).to.have.property('VpcId', vpcId);
      });
    });

    it('should pass enableDnsHostnames parameter to modifyVpcAttribute', () => {
      //Arrange

      let modifyVpcAttributeResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        modifyVpcAttribute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(modifyVpcAttributeResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const vpcId = 'vpc-abc123';

      //Act
      let resultPromise = vpcClientService._modifyVpcAttributes(vpcId, false, true);

      //Assert
      return resultPromise.then(() => {
        let enableDnsHostNamesParams = __.filter(awsEc2ClientMock.modifyVpcAttribute.args, function(item) {
          return item[0].EnableDnsHostnames;
        });

        expect(enableDnsHostNamesParams[0][0].EnableDnsHostnames).to.have.property('Value', false);
      });
    });

    it('should pass enableDnsSupport parameter to modifyVpcAttribute', () => {
      //Arrange

      let modifyVpcAttributeResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        modifyVpcAttribute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(modifyVpcAttributeResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const vpcId = 'vpc-abc123';

      //Act
      let resultPromise = vpcClientService._modifyVpcAttributes(vpcId, true, false);

      //Assert
      return resultPromise.then(() => {
        let enableDnsSupportParams = __.filter(awsEc2ClientMock.modifyVpcAttribute.args, function(item) {
          return item[0].EnableDnsSupport;
        });

        expect(enableDnsSupportParams[0][0].EnableDnsSupport).to.have.property('Value', false);
      });
    });
  });

  describe('_createTags', () => {
    it('should not throw error if tags parameter is not an array', () => {
      //Arrange
      let createTagsResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testResourceId = 'testResourceId';

      //Act
      try {
        let resultPromise = vpcClientService._createTags(testResourceId, null);
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
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testResourceId = 'testResourceId';

      //Act
      let resultPromise = vpcClientService._createTags(testResourceId, []);

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
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testResourceId = 'testResourceId';
      const tagsArray = [{Key: 'Name', Value: 'value1'}];

      //Act
      let resultPromise = vpcClientService._createTags(testResourceId, tagsArray);

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
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testResourceId = 'testResourceId';
      const tagsArray = [{Key: 'Name', Value: 'value1'}];

      //Act
      let resultPromise = vpcClientService._createTags(testResourceId, tagsArray);

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
        createTags: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createTagsResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testResourceId = 'testResourceId';
      const tagsArray = [{Key: 'Name', Value: 'value1'}];

      //Act
      let resultPromise = vpcClientService._createTags(testResourceId, tagsArray, false);

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

  describe('_describeRouteTables', () => {
    it('should pass peeringConnectionId to describeRouteTables method', () => {
      //Arrange

      let describeRouteTablesResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeRouteTables: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeRouteTablesResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testPeeringConnectionId = 'testPeeringConnectionId';
      const testRouteTableId = 'testRouteTableId';

      //Act
      let resultPromise = vpcClientService._describeRouteTables(testPeeringConnectionId, testRouteTableId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeRouteTables.args[0][0];

        expect(params.DryRun).to.be.false;
        expect(params.Filters[0].Values[0]).to.be.equal(testPeeringConnectionId);
      });
    });

    it('should pass testRouteTableId to describeRouteTables method', () => {
      //Arrange

      let describeRouteTablesResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        describeRouteTables: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeRouteTablesResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testPeeringConnectionId = 'testPeeringConnectionId';
      const testRouteTableId = 'testRouteTableId';

      //Act
      let resultPromise = vpcClientService._describeRouteTables(testPeeringConnectionId, testRouteTableId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.describeRouteTables.args[0][0];

        expect(params.DryRun).to.be.false;
        expect(params.RouteTableIds[0]).to.be.equal(testRouteTableId);
      });
    });
  });

  describe('_acceptVpcPeeringConnection', () => {
    it('should pass peeringConnectionId to acceptVpcPeeringConnection method', () => {
      //Arrange

      let acceptVpcPeeringConnectionResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        acceptVpcPeeringConnection: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(acceptVpcPeeringConnectionResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testPeeringConnectionId = 'testPeeringConnectionId';

      //Act
      let resultPromise = vpcClientService._acceptVpcPeeringConnection(testPeeringConnectionId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.acceptVpcPeeringConnection.args[0][0];

        expect(params.DryRun).to.be.false;
        expect(params.VpcPeeringConnectionId).to.be.equal(testPeeringConnectionId);
      });
    });
  });

  describe('_createRoute', () => {
    it('should pass DestinationCidrBlock to createRoute method', () => {
      //Arrange

      let createRouteResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRoute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testDestinationCidrBlock = 'testDestinationCidrBlock';
      const testRouteTableId = 'testRouteTableId';
      const testVpcPeeringConnectionId = 'testVpcPeeringConnectionId';

      //Act
      let resultPromise = vpcClientService._createRoute(testDestinationCidrBlock, testRouteTableId, testVpcPeeringConnectionId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createRoute.args[0][0];

        expect(params.DestinationCidrBlock).to.be.equal(testDestinationCidrBlock);
      });
    });

    it('should pass RouteTableId to createRoute method', () => {
      //Arrange

      let createRouteResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRoute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testDestinationCidrBlock = 'testDestinationCidrBlock';
      const testRouteTableId = 'testRouteTableId';
      const testVpcPeeringConnectionId = 'testVpcPeeringConnectionId';

      //Act
      let resultPromise = vpcClientService._createRoute(testDestinationCidrBlock, testRouteTableId, testVpcPeeringConnectionId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createRoute.args[0][0];

        expect(params.RouteTableId).to.be.equal(testRouteTableId);
      });
    });

    it('should pass VpcPeeringConnectionId to createRoute method', () => {
      //Arrange

      let createRouteResponse = {};

      //setting up ec2Client Mock
      let awsEc2ClientMock = {
        createRoute: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createRouteResponse);} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const VPC = proxyquire('../src/vpcClient', mocks);
      const vpcClientService = new VPC();


      const testDestinationCidrBlock = 'testDestinationCidrBlock';
      const testRouteTableId = 'testRouteTableId';
      const testVpcPeeringConnectionId = 'testVpcPeeringConnectionId';

      //Act
      let resultPromise = vpcClientService._createRoute(testDestinationCidrBlock, testRouteTableId, testVpcPeeringConnectionId);

      //Assert
      return resultPromise.then(() => {
        let params = awsEc2ClientMock.createRoute.args[0][0];

        expect(params.VpcPeeringConnectionId).to.be.equal(testVpcPeeringConnectionId);
      });
    });
  });

  describe('createOrUpdatePeeringConnection', () => {

    let vpcClientService;
    let peeringConnectionId;
    let routeTableIds;
    let destinationCidrBlock;
    let awsEc2ClientMock;
    beforeEach(() => {

      //setting up ec2Client Mock
      awsEc2ClientMock = {
        createRoute: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        }),
        describeVpcPeeringConnections: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._acceptVpcPeeringConnections = sandbox.stub().resolves({});
      vpcClientService._describeRouteTables = sandbox.stub().resolves({});
      vpcClientService._createRoute = sandbox.stub().resolves({});
      vpcClientService._acceptVpcPeeringConnection = sandbox.stub().resolves({});

      peeringConnectionId = 'myPeeringConnectionId';
      routeTableIds = ['myRouteTableId'];
      destinationCidrBlock = 'myDestinationCidrBlock';
    });

    it('should call _awsEc2Client.describeVpcPeeringConnections once', async () => {
      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(awsEc2ClientMock.describeVpcPeeringConnections.callCount).to.be.equal(1);
    });

    it('should pass params to _awsEc2Client.describeVpcPeeringConnections', async () => {
      // Arrange
      const expectedParams = {
        DryRun: false,
        Filters: [
          {
            Name: 'status-code',
            Values: [
              'pending-acceptance'
            ]
          }
        ],
        VpcPeeringConnectionIds: [
          'myPeeringConnectionId'
        ]
      };

      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(awsEc2ClientMock.describeVpcPeeringConnections.args[0][0]).to.be.deep.equal(expectedParams);
    });

    it('should not call _acceptVpcPeeringConnections if no pending VPC peering connection sare found', async () => {
      // Arrange
      awsEc2ClientMock.describeVpcPeeringConnections = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({})
      });

      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(vpcClientService._acceptVpcPeeringConnection.callCount).to.be.equal(0);
    });

    it('should call _acceptVpcPeeringConnection if a pending VPC peering connection is found by _awsEc2Client.describeVpcPeeringConnections', async () => {
      // Arrange
      awsEc2ClientMock.describeVpcPeeringConnections = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({ VpcPeeringConnections: '12345' })
      });

      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(vpcClientService._acceptVpcPeeringConnection.callCount).to.be.equal(1);
    });

    it('should pass peeringConnectionId to _accepetVpcPeeringConnection', async () => {
      // Arrange
      awsEc2ClientMock.describeVpcPeeringConnections = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({ VpcPeeringConnections: '12345' })
      });

      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(vpcClientService._acceptVpcPeeringConnection.args[0][0]).to.be.equal('myPeeringConnectionId');
    });

    it('should call _describeRouteTables once', async () => {
      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(vpcClientService._describeRouteTables.callCount).to.be.equal(1);
    });

    it('should pass params to _describeRouteTables', async () => {
      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(vpcClientService._describeRouteTables.args[0][0]).to.be.equal('myPeeringConnectionId');
      expect(vpcClientService._describeRouteTables.args[0][1]).to.be.equal('myRouteTableId');
    });

    it('should NOT call _createRoute if a route already exists', async () => {
      // Arrange
      vpcClientService._describeRouteTables = sandbox.stub().resolves({ RouteTables: ['a', 'b'] });

      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(vpcClientService._createRoute.callCount).to.be.equal(0);
    });

    it('should call _createRoute if no route exists', async () => {
      // Arrange
      vpcClientService._describeRouteTables = sandbox.stub().resolves({ RouteTables: [] });

      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(vpcClientService._createRoute.callCount).to.be.equal(1);
    });

    it('should pass params to _createRoute', async () => {
      // Arrange
      vpcClientService._describeRouteTables = sandbox.stub().resolves({ RouteTables: [] });

      // Act
      await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      // Assert
      expect(vpcClientService._createRoute.args[0][0]).to.be.equal('myDestinationCidrBlock');
      expect(vpcClientService._createRoute.args[0][1]).to.be.equal('myRouteTableId');
      expect(vpcClientService._createRoute.args[0][2]).to.be.equal('myPeeringConnectionId');
    });

    it('should throw an error on unexpected error', async () => {
      // Arrange
      awsEc2ClientMock.describeVpcPeeringConnections = sandbox.stub().returns({
        promise: () => BluebirdPromise.reject({ message: 'An unexpected error occurred!' })
      });

      try {
        // Act
        await vpcClientService.createOrUpdatePeeringConnection(peeringConnectionId, routeTableIds, destinationCidrBlock);

      } catch (err) {
        // Assert
        expect(err.message).to.be.equal('An unexpected error occurred!');
      }
    });
  });

  describe('createNATGateway', () => {

    const VPC_ID = 'vpc-123adb';
    const SUBNET_ID = 'sub-asfdasfdas';
    const ENVIRONMENT = 'safdsafdas';
    let vpcClientService;
    let awsEc2ClientMock;
    let mocks;

    beforeEach(() => {

      //setting up ec2Client Mock
      awsEc2ClientMock = {
        describeNatGateways: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({
            NatGateways: []
          })
        }),
        allocateAddress: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        }),
        createNatGateway: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({
            NatGateway: {}
          })
        }),
        waitFor: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      mocks = {
        'aws-sdk': mockAwsSdk
      };

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves({});
      vpcClientService._createTags = sandbox.stub().resolves({});

    });


    it('should return without calling createNatGateway if one with the same name exists', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';
      awsEc2ClientMock.describeNatGateways = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          NatGateways: [
            {
              NatGatewayId: 'nat-123',
              subnetId: SUBNET_ID,
              vpcId: VPC_ID,
              Tags: [
                { Key: 'Name', Value: natGatewayName }
              ]
            }
          ]
        })
      });

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves({});
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(awsEc2ClientMock.createNatGateway.callCount).to.be.equal(0);
    });

    it('should return NatGatewayId if Nat Gateway with that name already exists', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';
      awsEc2ClientMock.describeNatGateways = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          NatGateways: [
            {
              NatGatewayId: 'nat-123',
              subnetId: SUBNET_ID,
              vpcId: VPC_ID,
              Tags: [
                { Key: 'Name', Value: natGatewayName }
              ]
            }
          ]
        })
      });

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves({});
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      const result = await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(result).to.be.equal('nat-123');
    });

    it('should call _getAvailableElasticIp once', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';


      //Act
      await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(vpcClientService._getAvailableElasticIp.calledOnce).to.be.true;
    });

    it('should call a new elasticIp if none are available', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';
      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves('');


      //Act
      await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(awsEc2ClientMock.allocateAddress.calledOnce).to.be.true;
    });

    it('should call createTags once', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';


      //Act
      await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(vpcClientService._createTags.calledOnce).to.be.true;
    });

    it('should call createNatGateway once if one doesnt exist', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';
      awsEc2ClientMock.describeNatGateways = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          NatGateways: []
        })
      });

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves({});
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(awsEc2ClientMock.createNatGateway.callCount).to.be.equal(1);
    });

    it('should return natGatewayId after successfully creating a new one', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';
      awsEc2ClientMock.createNatGateway = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          NatGateway: {
            NatGatewayId: 'nat-345'
          }
        })
      });

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves({});
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      const result = await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(result).to.be.equal('nat-345');
    });

    it('should call waitFor once', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';
      awsEc2ClientMock.createNatGateway = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          NatGateway: {
            NatGatewayId: 'nat-345'
          }
        })
      });

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves({});
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(awsEc2ClientMock.waitFor.calledOnce).to.be.true;
    });

    it('should pass natGatewayAvailable constant to waitFor', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';
      awsEc2ClientMock.createNatGateway = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          NatGateway: {
            NatGatewayId: 'nat-345'
          }
        })
      });

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves({});
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(awsEc2ClientMock.waitFor.args[0][0]).to.be.equal('natGatewayAvailable');
    });

    it('should pass natGatewayId to waitFor', async () => {
      //Arrange
      const natGatewayName = 'safdsafas';
      awsEc2ClientMock.createNatGateway = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          NatGateway: {
            NatGatewayId: 'nat-345'
          }
        })
      });

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves({});
      vpcClientService._createTags = sandbox.stub().resolves({});


      //Act
      await vpcClientService.createNATGateway(VPC_ID, SUBNET_ID, natGatewayName, ENVIRONMENT);

      //Assert
      expect(awsEc2ClientMock.waitFor.args[0][1]).to.be.deep.equal({'NatGatewayIds': ['nat-345']});
    });
  });

  describe('_getAvailableElasticIp', () => {

    let vpcClientService;
    let awsEc2ClientMock;
    let mocks;

    beforeEach(() => {

      //setting up ec2Client Mock
      awsEc2ClientMock = {
        describeAddresses: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({
            Addresses: []
          })
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      mocks = {
        'aws-sdk': mockAwsSdk
      };

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();
    });

    it('should call describeAddresses once', async () => {
      //Arrange

      //Act
      await vpcClientService._getAvailableElasticIp();

      //Assert
      expect(awsEc2ClientMock.describeAddresses.calledOnce).to.be.true;
    });

    it('should return empty string if no available elasticIPs', async () => {
      //Arrange
      awsEc2ClientMock.describeAddresses = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          Addresses: [
            {
              AllocationId: "eipalloc-12345678",
              AssociationId: "eipassoc-12345678",
              Domain: "vpc",
              InstanceId: "i-1234567890abcdef0",
              NetworkInterfaceId: "eni-12345678",
              NetworkInterfaceOwnerId: "123456789012",
              PrivateIpAddress: "10.0.1.241",
              PublicIp: "203.0.113.0"
            }
          ]
        })
      });

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      //Act
      const result = await vpcClientService._getAvailableElasticIp();

      //Assert
      expect(result).to.be.equal('');
    });

    it('should return allocationId of unassociated elasticIP', async () => {
      //Arrange
      awsEc2ClientMock.describeAddresses = sandbox.stub().returns({
        promise: () => BluebirdPromise.resolve({
          Addresses: [
            {
              AllocationId: "eipalloc-12345678",
              Domain: "vpc",
              PublicIp: "203.0.113.0"
            },
            {
              AllocationId: "eipalloc-12345678",
              AssociationId: "eipassoc-12345678",
              Domain: "vpc",
              InstanceId: "i-1234567890abcdef0",
              NetworkInterfaceId: "eni-12345678",
              NetworkInterfaceOwnerId: "123456789012",
              PrivateIpAddress: "10.0.1.241",
              PublicIp: "203.0.113.0"
            }
          ]
        })
      });

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      //Act
      const result = await vpcClientService._getAvailableElasticIp();

      //Assert
      expect(result).to.be.equal('eipalloc-12345678');
    });
  });

  describe('addNATGatewayToRouteTable', () => {

    let vpcClientService;
    let awsEc2ClientMock;
    let mocks;

    beforeEach(() => {

      //setting up ec2Client Mock
      awsEc2ClientMock = {
        createRoute: sandbox.stub().returns({
          promise: () => BluebirdPromise.resolve({})
        })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        EC2: function() {
          return awsEc2ClientMock;
        }
      };

      //Setting up VPC clients
      mocks = {
        'aws-sdk': mockAwsSdk
      };

      const VPC = proxyquire('../src/vpcClient', mocks);
      vpcClientService = new VPC();

      vpcClientService._getAvailableElasticIp = sandbox.stub().resolves({});
      vpcClientService._createTags = sandbox.stub().resolves({});

    });

    it('should call createRoute once', async () => {
      //Arrange

      //Act
      await vpcClientService.addNATGatewayToRouteTable('nat-123123', 'rt-asfdafdas');

      //Assert
      expect(awsEc2ClientMock.createRoute.calledOnce).to.be.true;
    });

    it('should pass natGatewayId to createRoute', async () => {
      //Arrange

      //Act
      await vpcClientService.addNATGatewayToRouteTable('nat-123123', 'rt-asfdafdas');

      //Assert
      expect(awsEc2ClientMock.createRoute.calledOnce).to.be.true;
    });

    it('should pass routeTableId to createRoute', async () => {
      //Arrange

      //Act
      await vpcClientService.addNATGatewayToRouteTable('nat-123123', 'rt-asfdafdas');

      //Assert
      expect(awsEc2ClientMock.createRoute.calledOnce).to.be.true;
    });
  });
});
