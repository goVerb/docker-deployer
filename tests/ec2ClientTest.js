const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;

//Test Includes
const EC2 = require('../src/ec2Client.js');

require('sinon-as-promised');
chai.use(chaiAsPromised);




describe('EC2 Client', function() {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {

    sandbox.restore();
  });


  describe('createSecurityGroupFromConfig', () => {
    const ENVIRONMENT = 'testenv';
    it('should pass securityGroupName to doesSecurityGroupExists method', () => {
      //Arrange
      const ec2ClientService = new EC2();
      let doesSecurityGroupExistsStub = sandbox.stub(ec2ClientService, 'doesSecurityGroupExists', () => {
        return Promise.resolve(true);
      });


      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(doesSecurityGroupExistsStub.args[0][0]).to.be.equal('dupeName');
      });
    });

    it('should pass vpcId to doesSecurityGroupExists method', () => {
      //Arrange
      const ec2ClientService = new EC2();
      let doesSecurityGroupExistsStub = sandbox.stub(ec2ClientService, 'doesSecurityGroupExists', () => {
        return Promise.resolve(true);
      });

      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(doesSecurityGroupExistsStub.args[0][1]).to.be.equal('123abc');
      });
    });

    it('should not call createSecurityGroup if securityGroup already exists', () => {
      //Arrange
      const ec2ClientService = new EC2();
      sandbox.stub(ec2ClientService, 'doesSecurityGroupExists', () => {
        return Promise.resolve(true);
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
      const ec2ClientService = new EC2();
      sandbox.stub(ec2ClientService, 'doesSecurityGroupExists', () => {
        return Promise.resolve(false);
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
      const ec2ClientService = new EC2();
      sandbox.stub(ec2ClientService, 'doesSecurityGroupExists', () => {
        return Promise.resolve(false);
      });

      let createSecurityGroupStub = sandbox.stub(ec2ClientService, '_createSecurityGroup');

      //Act
      let resultPromise = ec2ClientService.createSecurityGroupFromConfig(ENVIRONMENT, {name: 'dupeName', vpcId: '123abc'});

      //Assert
      return resultPromise.then(() => {
        expect(createSecurityGroupStub.args[0][0]).to.be.equal(ENVIRONMENT);
      });
    });
  })
});
