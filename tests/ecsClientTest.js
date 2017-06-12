const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const __ = require('lodash');
const BluebirdPromise = require('bluebird');
import proxyquire from 'proxyquire';



chai.use(chaiAsPromised);




describe('ECS Client', function() {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getter _awsEcsClient', () => {
    it('should pass accessKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: sandbox.stub()

      };

      //Setting up ECS clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS(accessKey, secretKey, region);


      //Act
      ecsClientService._awsEcsClient;

      //Assert
      let params = mockAwsSdk.ECS.args[0][0];
      expect(params).to.have.property('accessKeyId', accessKey);
    });

    it('should pass secretKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: sandbox.stub()

      };

      //Setting up ECS clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS(accessKey, secretKey, region);


      //Act
      ecsClientService._awsEcsClient;

      //Assert
      let params = mockAwsSdk.ECS.args[0][0];
      expect(params).to.have.property('secretAccessKey', secretKey);
    });

    it('should pass region to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: sandbox.stub()

      };

      //Setting up ECS clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS(accessKey, secretKey, region);


      //Act
      ecsClientService._awsEcsClient;

      //Assert
      let params = mockAwsSdk.ECS.args[0][0];
      expect(params).to.have.property('region', region);
    });

    it('should pass default region of us-west-2 if none specified', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: sandbox.stub()

      };

      //Setting up ECS clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS(accessKey, secretKey);


      //Act
      ecsClientService._awsEcsClient;

      //Assert
      let params = mockAwsSdk.ECS.args[0][0];
      expect(params).to.have.property('region', 'us-west-2');
    });
  });

  describe('createCluster', () => {
    it('should pass clusterName to getClusterArn', () => {
      //Arrange
      const clusterName = 'clusterName';

      //Setting up ECS clients
      const ECS = require('../src/ecsClient');
      const ecsClientService = new ECS();
      ecsClientService.getClusterArn = sandbox.stub().resolves('');
      ecsClientService._createCluster = sandbox.stub().resolves({});


      //Act
      let resultPromise = ecsClientService.createCluster(clusterName);

      //Assert
      return resultPromise.then(() => {
        expect(ecsClientService.getClusterArn.args[0][0]).to.be.equal(clusterName);
      });
    });

    it('should not call _createCluster if cluster already exist', () => {
      //Arrange
      const clusterName = 'clusterName';

      //Setting up ECS clients
      const ECS = require('../src/ecsClient');
      const ecsClientService = new ECS();
      ecsClientService.getClusterArn = sandbox.stub().resolves('existingArn');
      ecsClientService._createCluster = sandbox.stub().resolves({});


      //Act
      let resultPromise = ecsClientService.createCluster(clusterName);

      //Assert
      return resultPromise.then(() => {
        expect(ecsClientService._createCluster.callCount).to.be.equal(0);
      });
    });

    it('should pass clusterName to _createCluster', () => {
      //Arrange
      const clusterName = 'clusterName';

      //Setting up ECS clients
      const ECS = require('../src/ecsClient');
      const ecsClientService = new ECS();
      ecsClientService.getClusterArn = sandbox.stub().resolves('');
      ecsClientService._createCluster = sandbox.stub().resolves({});


      //Act
      let resultPromise = ecsClientService.createCluster(clusterName);

      //Assert
      return resultPromise.then(() => {
        expect(ecsClientService._createCluster.args[0][0]).to.be.equal(clusterName);
      });
    });

    it('should call _createCluster once if cluster doesnt exist', () => {
      //Arrange
      const clusterName = 'clusterName';

      //Setting up ECS clients
      const ECS = require('../src/ecsClient');
      const ecsClientService = new ECS();
      ecsClientService.getClusterArn = sandbox.stub().resolves('');
      ecsClientService._createCluster = sandbox.stub().resolves({});


      //Act
      let resultPromise = ecsClientService.createCluster(clusterName);

      //Assert
      return resultPromise.then(() => {
        expect(ecsClientService._createCluster.callCount).to.be.equal(1);
      });
    });
  });

  describe('_createCluster', () => {
    it('should pass clusterName to createCluster method', () => {
      //Arrange
      const clusterName = 'clusterName';
      let createClusterResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        createCluster: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createClusterResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createCluster(clusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createCluster.args[0][0];
        expect(params).to.have.property('clusterName', clusterName);
      });
    });
  });

  describe('registerTaskDefinition', () => {
    it('should pass taskName to registerTaskDefinition method', () => {
      //Arrange
      const taskName = 'taskName';
      const networkMode = 'bridge';
      const taskRoleArn = 'taskRoleArn';
      const containerDefinitions = [
        {
          name: '***REMOVED***-API-Container',
          image: '***REMOVED***.dkr.ecr.us-west-2.amazonaws.com/***REMOVED***-api:beta1',
          disableNetworking: false,
          privileged: false,
          readonlyRootFilesystem: true,
          memory: '300',
          memoryReservation: '300',
          essential: true,
          portMappings: [
            {
              containerPort: 8080,
              hostPort: 0,
              protocol: 'tcp'
            }
          ],
          command: [],
          cpu: 0,
          dnsSearchDomains: [],
          dnsServers: [],
          dockerLabels: {},
          dockerSecurityOptions: [],
          entryPoint: [],
          environment: [],
          extraHosts: [],
          hostname: null,
          links: [],
          logConfiguration: {
            logDriver: 'json-file'
          },
          mountPoints: [],
          ulimits: [],
          user: null,
          volumesFrom: [],
          workingDirectory: null
        }
      ];
      let registerTaskDefinitionResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        registerTaskDefinition: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(registerTaskDefinitionResponse)} })
      };

const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.registerTaskDefinition(taskName, networkMode, taskRoleArn, containerDefinitions);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.registerTaskDefinition.args[0][0];
        expect(params).to.have.property('family', taskName);
      });
    });

    it('should pass networkMode to registerTaskDefinition method', () => {
      //Arrange
      const taskName = 'taskName';
      const networkMode = 'bridge';
      const taskRoleArn = 'taskRoleArn';
      const containerDefinitions = [
        {
          name: '***REMOVED***-API-Container',
          image: '***REMOVED***.dkr.ecr.us-west-2.amazonaws.com/***REMOVED***-api:beta1',
          disableNetworking: false,
          privileged: false,
          readonlyRootFilesystem: true,
          memory: '300',
          memoryReservation: '300',
          essential: true,
          portMappings: [
            {
              containerPort: 8080,
              hostPort: 0,
              protocol: 'tcp'
            }
          ],
          command: [],
          cpu: 0,
          dnsSearchDomains: [],
          dnsServers: [],
          dockerLabels: {},
          dockerSecurityOptions: [],
          entryPoint: [],
          environment: [],
          extraHosts: [],
          hostname: null,
          links: [],
          logConfiguration: {
            logDriver: 'json-file'
          },
          mountPoints: [],
          ulimits: [],
          user: null,
          volumesFrom: [],
          workingDirectory: null
        }
      ];
      let registerTaskDefinitionResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        registerTaskDefinition: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(registerTaskDefinitionResponse)} })
      };

const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.registerTaskDefinition(taskName, networkMode, taskRoleArn, containerDefinitions);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.registerTaskDefinition.args[0][0];
        expect(params).to.have.property('networkMode', networkMode);
      });
    });

    it('should pass taskRoleArn to registerTaskDefinition method', () => {
      //Arrange
      const taskName = 'taskName';
      const networkMode = 'bridge';
      const taskRoleArn = 'taskRoleArn';
      const containerDefinitions = [
        {
          name: '***REMOVED***-API-Container',
          image: '***REMOVED***.dkr.ecr.us-west-2.amazonaws.com/***REMOVED***-api:beta1',
          disableNetworking: false,
          privileged: false,
          readonlyRootFilesystem: true,
          memory: '300',
          memoryReservation: '300',
          essential: true,
          portMappings: [
            {
              containerPort: 8080,
              hostPort: 0,
              protocol: 'tcp'
            }
          ],
          command: [],
          cpu: 0,
          dnsSearchDomains: [],
          dnsServers: [],
          dockerLabels: {},
          dockerSecurityOptions: [],
          entryPoint: [],
          environment: [],
          extraHosts: [],
          hostname: null,
          links: [],
          logConfiguration: {
            logDriver: 'json-file'
          },
          mountPoints: [],
          ulimits: [],
          user: null,
          volumesFrom: [],
          workingDirectory: null
        }
      ];
      let registerTaskDefinitionResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        registerTaskDefinition: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(registerTaskDefinitionResponse)} })
      };

const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.registerTaskDefinition(taskName, networkMode, taskRoleArn, containerDefinitions);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.registerTaskDefinition.args[0][0];
        expect(params).to.have.property('taskRoleArn', taskRoleArn);
      });
    });

    it('should pass containerDefinitions to registerTaskDefinition method', () => {
      //Arrange
      const taskName = 'taskName';
      const networkMode = 'bridge';
      const taskRoleArn = 'taskRoleArn';
      const containerDefinitions = [
        {
          name: '***REMOVED***-API-Container',
          image: '***REMOVED***.dkr.ecr.us-west-2.amazonaws.com/***REMOVED***-api:beta1',
          disableNetworking: false,
          privileged: false,
          readonlyRootFilesystem: true,
          memory: '300',
          memoryReservation: '300',
          essential: true,
          portMappings: [
            {
              containerPort: 8080,
              hostPort: 0,
              protocol: 'tcp'
            }
          ],
          command: [],
          cpu: 0,
          dnsSearchDomains: [],
          dnsServers: [],
          dockerLabels: {},
          dockerSecurityOptions: [],
          entryPoint: [],
          environment: [],
          extraHosts: [],
          hostname: null,
          links: [],
          logConfiguration: {
            logDriver: 'json-file'
          },
          mountPoints: [],
          ulimits: [],
          user: null,
          volumesFrom: [],
          workingDirectory: null
        }
      ];
      let registerTaskDefinitionResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        registerTaskDefinition: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(registerTaskDefinitionResponse)} })
      };

const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.registerTaskDefinition(taskName, networkMode, taskRoleArn, containerDefinitions);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.registerTaskDefinition.args[0][0];
        expect(params).to.have.property('containerDefinitions');
        expect(params.containerDefinitions).to.be.deep.equal(containerDefinitions);
      });
    });

    it('should pass volumes=[] to registerTaskDefinition method', () => {
      //Arrange
      const taskName = 'taskName';
      const networkMode = 'bridge';
      const taskRoleArn = 'taskRoleArn';
      const containerDefinitions = [
        {
          name: '***REMOVED***-API-Container',
          image: '***REMOVED***.dkr.ecr.us-west-2.amazonaws.com/***REMOVED***-api:beta1',
          disableNetworking: false,
          privileged: false,
          readonlyRootFilesystem: true,
          memory: '300',
          memoryReservation: '300',
          essential: true,
          portMappings: [
            {
              containerPort: 8080,
              hostPort: 0,
              protocol: 'tcp'
            }
          ],
          command: [],
          cpu: 0,
          dnsSearchDomains: [],
          dnsServers: [],
          dockerLabels: {},
          dockerSecurityOptions: [],
          entryPoint: [],
          environment: [],
          extraHosts: [],
          hostname: null,
          links: [],
          logConfiguration: {
            logDriver: 'json-file'
          },
          mountPoints: [],
          ulimits: [],
          user: null,
          volumesFrom: [],
          workingDirectory: null
        }
      ];
      let registerTaskDefinitionResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        registerTaskDefinition: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(registerTaskDefinitionResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.registerTaskDefinition(taskName, networkMode, taskRoleArn, containerDefinitions);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.registerTaskDefinition.args[0][0];
        expect(params).to.have.property('volumes');
        expect(params.volumes).to.be.deep.equal([]);
      });
    });
  });

  describe('createOrUpdateService', () => {
    it('should call _updateService if getServiceArn returns a serviceArn', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';

      //Setting up ECS clients
      const ECS = require('../src/ecsClient');
      const ecsClientService = new ECS();
      ecsClientService.getServiceArn = sandbox.stub().resolves('existingArn');
      ecsClientService._updateService = sandbox.stub().resolves({});
      ecsClientService._createService = sandbox.stub().resolves({});



      //Act
      let resultPromise = ecsClientService.createOrUpdateService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        expect(ecsClientService._updateService.callCount).to.be.equal(1);
        expect(ecsClientService._createService.callCount).to.be.equal(0);
      });
    });

    it('should pass parameters to _updateService if getServiceArn returns a serviceArn', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';

      //Setting up ECS clients
      const ECS = require('../src/ecsClient');
      const ecsClientService = new ECS();
      ecsClientService.getServiceArn = sandbox.stub().resolves('existingArn');
      ecsClientService._updateService = sandbox.stub().resolves({});
      ecsClientService._createService = sandbox.stub().resolves({});



      //Act
      let resultPromise = ecsClientService.createOrUpdateService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        expect(ecsClientService._updateService.args[0][0]).to.be.equal(clusterName);
        expect(ecsClientService._updateService.args[0][1]).to.be.equal(serviceName);
        expect(ecsClientService._updateService.args[0][2]).to.be.equal(taskDefinition);
        expect(ecsClientService._updateService.args[0][3]).to.be.equal(desiredCount);
      });
    });

    it('should call _createService if getServiceArn doesnt return a serviceArn', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';

      //Setting up ECS clients
      const ECS = require('../src/ecsClient');
      const ecsClientService = new ECS();
      ecsClientService.getServiceArn = sandbox.stub().resolves('');
      ecsClientService._updateService = sandbox.stub().resolves({});
      ecsClientService._createService = sandbox.stub().resolves({});



      //Act
      let resultPromise = ecsClientService.createOrUpdateService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        expect(ecsClientService._updateService.callCount).to.be.equal(0);
        expect(ecsClientService._createService.callCount).to.be.equal(1);
      });
    });

    it('should pass parameters to _createService if getServiceArn doesnt return a serviceArn', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';

      //Setting up ECS clients
      const ECS = require('../src/ecsClient');
      const ecsClientService = new ECS();
      ecsClientService.getServiceArn = sandbox.stub().resolves('');
      ecsClientService._updateService = sandbox.stub().resolves({});
      ecsClientService._createService = sandbox.stub().resolves({});



      //Act
      let resultPromise = ecsClientService.createOrUpdateService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        expect(ecsClientService._createService.args[0][0]).to.be.equal(clusterName);
        expect(ecsClientService._createService.args[0][1]).to.be.equal(serviceName);
        expect(ecsClientService._createService.args[0][2]).to.be.equal(taskDefinition);
        expect(ecsClientService._createService.args[0][3]).to.be.equal(desiredCount);
        expect(ecsClientService._createService.args[0][4]).to.be.equal(containerName);
        expect(ecsClientService._createService.args[0][5]).to.be.equal(containerPort);
        expect(ecsClientService._createService.args[0][6]).to.be.equal(targetGroupArn);
      });
    });
  });

  describe('_createService', () => {
    it('should pass clusterName to createService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';
      let createServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        createService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createServiceResponse)} })
      };

const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createService.args[0][0];
        expect(params).to.have.property('cluster', clusterName);
      });
    });

    it('should pass serviceName to createService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';
      let createServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        createService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createServiceResponse)} })
      };

const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createService.args[0][0];
        expect(params).to.have.property('serviceName', serviceName);
      });
    });

    it('should pass taskDefinition to createService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';
      let createServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        createService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createServiceResponse)} })
      };

const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createService.args[0][0];
        expect(params).to.have.property('taskDefinition', taskDefinition);
      });
    });

    it('should pass desiredCount to createService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = 123;
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';
      let createServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        createService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createServiceResponse)} })
      };

const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createService.args[0][0];
        expect(params).to.have.property('desiredCount', desiredCount);
      });
    });

    it('should pass containerName to createService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = 123;
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';
      let createServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        createService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createServiceResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createService.args[0][0];
        expect(params).to.have.nested.property('loadBalancers[0].containerName', containerName);
      });
    });

    it('should pass containerPort to createService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = 123;
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';
      let createServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        createService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createServiceResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createService.args[0][0];
        expect(params).to.have.nested.property('loadBalancers[0].containerPort', containerPort);
      });
    });

    it('should pass targetGroupArn to createService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = 123;
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';
      let createServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        createService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createServiceResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createService.args[0][0];
        expect(params).to.have.nested.property('loadBalancers[0].targetGroupArn', targetGroupArn);
      });
    });

    it('should pass deploymentConfiguration.maximumPercent=200 to createService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = 123;
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';
      let createServiceResponse = {};

      //setting up ecsClient Mock
      let awsEcsClientMock = {
        createService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createServiceResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createService.args[0][0];
        expect(params).to.have.nested.property('deploymentConfiguration.maximumPercent', 200);
      });
    });

    it('should pass deploymentConfiguration.minimumHealthyPercent=50 to createService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = 123;
      const containerName = 'test-container-name';
      const containerPort = 8080;
      const targetGroupArn = 'targetGroupArn';
      let createServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        createService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(createServiceResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._createService(clusterName, serviceName, taskDefinition, desiredCount, containerName, containerPort, targetGroupArn);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.createService.args[0][0];
        expect(params).to.have.nested.property('deploymentConfiguration.minimumHealthyPercent', 50);
      });
    });
  });

  describe('_updateService', () => {
    it('should pass clusterName to updateService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      let updateServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        updateService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(updateServiceResponse)} })
      };

const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._updateService(clusterName, serviceName, taskDefinition, desiredCount);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.updateService.args[0][0];
        expect(params).to.have.property('cluster', clusterName);
      });
    });

    it('should pass serviceName to updateService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      let updateServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        updateService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(updateServiceResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._updateService(clusterName, serviceName, taskDefinition, desiredCount);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.updateService.args[0][0];
        expect(params).to.have.property('service', serviceName);
      });
    });

    it('should pass taskDefinition to updateService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = '123';
      let updateServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        updateService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(updateServiceResponse)} })
      };


      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._updateService(clusterName, serviceName, taskDefinition, desiredCount);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.updateService.args[0][0];
        expect(params).to.have.property('taskDefinition', taskDefinition);
      });
    });

    it('should pass desiredCount to updateService method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      const taskDefinition = 'task-Test';
      const desiredCount = 123;
      let updateServiceResponse = {};

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        updateService: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(updateServiceResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService._updateService(clusterName, serviceName, taskDefinition, desiredCount);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.updateService.args[0][0];
        expect(params).to.have.property('desiredCount', desiredCount);
      });
    });
  });

  describe('getServiceArn', () => {
    it('should pass clusterName to describeServices method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      let describeServicesResponse = {
        services: [
          {
            clusterArn: 'arn:aws:ecs:us-east-1:012345678910:cluster/default',
            serviceArn: 'arn:aws:ecs:us-east-1:012345678910:service/ecs-simple-service',
            serviceName: serviceName,
            status: 'ACTIVE',
          }
        ],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeServices: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeServicesResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.getServiceArn(clusterName, serviceName);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.describeServices.args[0][0];
        expect(params).to.have.property('cluster', clusterName);
      });
    });

    it('should pass serviceName to describeServices method', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      let describeServicesResponse = {
        services: [
          {
            clusterArn: 'arn:aws:ecs:us-east-1:012345678910:cluster/default',
            serviceArn: 'arn:aws:ecs:us-east-1:012345678910:service/ecs-simple-service',
            serviceName: serviceName,
            status: 'ACTIVE',
          }
        ],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeServices: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeServicesResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.getServiceArn(clusterName, serviceName);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.describeServices.args[0][0];
        expect(params).to.have.property('services');
        expect(params.services[0]).to.be.equal(serviceName);
      });
    });

    it('should pass serviceArn if service exist and status:ACTIVE', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      let describeServicesResponse = {
        services: [
          {
            clusterArn: 'arn:aws:ecs:us-east-1:012345678910:cluster/default',
            serviceArn: 'arn:aws:ecs:us-east-1:012345678910:service/ecs-simple-service',
            serviceName: serviceName,
            status: 'ACTIVE',
          }
        ],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeServices: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeServicesResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.getServiceArn(clusterName, serviceName);

      //Assert
      return resultPromise.then(foundServiceArn => {
        expect(foundServiceArn).to.be.equal(describeServicesResponse.services[0].serviceArn);
      });
    });

    it('should pass serviceArn for first active service', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      let describeServicesResponse = {
        services: [
          {
            clusterArn: 'arn:aws:ecs:us-east-1:012345678910:cluster/default',
            serviceArn: 'arn:aws:ecs:us-east-1:012345678910:service/ecs-simple-service1',
            serviceName: serviceName,
            status: 'INACTIVE',
          },
          {
            clusterArn: 'arn:aws:ecs:us-east-1:012345678910:cluster/default',
            serviceArn: 'arn:aws:ecs:us-east-1:012345678910:service/ecs-simple-service2',
            serviceName: serviceName,
            status: 'INACTIVE',
          },
          {
            clusterArn: 'arn:aws:ecs:us-east-1:012345678910:cluster/default',
            serviceArn: 'arn:aws:ecs:us-east-1:012345678910:service/ecs-simple-service3',
            serviceName: serviceName,
            status: 'ACTIVE',
          }
        ],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeServices: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeServicesResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.getServiceArn(clusterName, serviceName);

      //Assert
      return resultPromise.then(foundServiceArn => {
        expect(foundServiceArn).to.be.equal('arn:aws:ecs:us-east-1:012345678910:service/ecs-simple-service3');
      });
    });

    it('should return empty string if service exist and status:INACTIVE', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      let describeServicesResponse = {
        services: [
          {
            clusterArn: 'arn:aws:ecs:us-east-1:012345678910:cluster/default',
            serviceArn: 'arn:aws:ecs:us-east-1:012345678910:service/ecs-simple-service',
            serviceName: serviceName,
            status: 'INACTIVE',
          }
        ],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeServices: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeServicesResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.getServiceArn(clusterName, serviceName);

      //Assert
      return resultPromise.then(foundServiceArn => {
        expect(foundServiceArn).to.be.equal('');
      });
    });

    it('should return empty string no services', () => {
      //Arrange
      const clusterName = 'testClusterName';
      const serviceName = 'testServiceName';
      let describeServicesResponse = {
        services: [],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeServices: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeServicesResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.getServiceArn(clusterName, serviceName);

      //Assert
      return resultPromise.then(foundServiceArn => {
        expect(foundServiceArn).to.be.equal('');
      });
    });
  });

  describe('getClusterArn', () => {
    it('should pass name to describeClusters', () => {
      //Arrange
      const clusterName = 'testClusterName';
      let describeClustersResponse = {
        clusters: [
          {
            clusterArn: "arn:aws:ecs:us-east-1:aws_account_id:cluster/default",
            clusterName: clusterName,
            status: "ACTIVE"
          }
        ],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeClusters: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeClustersResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.getClusterArn(clusterName);

      //Assert
      return resultPromise.then(() => {
        let params = awsEcsClientMock.describeClusters.args[0][0];
        expect(params.clusters[0]).to.be.equal(clusterName);
      });
    });

    it('should return clusterArn if cluster exist and status:ACTIVE', () => {
      //Arrange
      const clusterName = 'testClusterName';
      let describeClustersResponse = {
        clusters: [
          {
            clusterArn: "arn:aws:ecs:us-east-1:aws_account_id:cluster/default",
            clusterName: clusterName,
            status: "ACTIVE"
          }
        ],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeClusters: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeClustersResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();




      //Act
      let resultPromise = ecsClientService.getClusterArn(clusterName);

      //Assert
      return resultPromise.then(foundClusterArn => {
        expect(foundClusterArn).to.be.equal(describeClustersResponse.clusters[0].clusterArn);
      });
    });

    it('should return clusterArn for first active cluster', () => {
      //Arrange
      const clusterName = 'testClusterName';
      let describeClustersResponse = {
        clusters: [
          {
            clusterArn: "arn:aws:ecs:us-east-1:aws_account_id:cluster/123",
            clusterName: clusterName,
            status: "INACTIVE"
          },
          {
            clusterArn: "arn:aws:ecs:us-east-1:aws_account_id:cluster/345",
            clusterName: clusterName,
            status: "INACTIVE"
          },
          {
            clusterArn: "arn:aws:ecs:us-east-1:aws_account_id:cluster/980",
            clusterName: clusterName,
            status: "ACTIVE"
          }
        ],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeClusters: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeClustersResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();




      //Act
      let resultPromise = ecsClientService.getClusterArn(clusterName);

      //Assert
      return resultPromise.then(foundClusterArn => {
        expect(foundClusterArn).to.be.equal('arn:aws:ecs:us-east-1:aws_account_id:cluster/980');
      });
    });

    it('should return empty string if cluster exist and status:INACTIVE', () => {
      //Arrange
      const clusterName = 'testClusterName';
      let describeClustersResponse = {
        clusters: [
          {
            clusterArn: "arn:aws:ecs:us-east-1:aws_account_id:cluster/default",
            clusterName: clusterName,
            status: "INACTIVE"
          }
        ],
        failures: [ ]
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeClusters: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeClustersResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();




      //Act
      let resultPromise = ecsClientService.getClusterArn(clusterName);

      //Assert
      return resultPromise.then(foundClusterArn => {
        expect(foundClusterArn).to.be.equal('');
      });
    });

    it('should return empty string no clusters', () => {
      //Arrange
      const clusterName = 'testClusterName';
      let describeClustersResponse = {
        clusters: [],
        failures: []
      };

      //setting up ec2Client Mock
      let awsEcsClientMock = {
        describeClusters: sandbox.stub().returns({promise: () => { return BluebirdPromise.resolve(describeClustersResponse)} })
      };

      const mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {}
        },
        ECS: () => {
          return awsEcsClientMock;
        }
      };

      //Setting up ECS clients
      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const ECS = proxyquire('../src/ecsClient', mocks);
      const ecsClientService = new ECS();


      //Act
      let resultPromise = ecsClientService.getClusterArn(clusterName);

      //Assert
      return resultPromise.then(foundClusterArn => {
        expect(foundClusterArn).to.be.equal('');
      });
    });
  });

});
