const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const __ = require('lodash');
const BluebirdPromise = require('bluebird');
import proxyquire from 'proxyquire';



chai.use(chaiAsPromised);


describe('Route53 Client', function () {
  let sandbox;
  const recordSets = [{
      Name: 'apple.dev-internal.yoursite.com',
      Type: 'A',
      SetIdentifier: 'SIP API Load balancer',
      Region: 'us-west-2',
      ResourceRecords: [],
      AliasTarget:
        {
          HostedZoneId: 'lalala',
          DNSName: 'magic.dns.name2',
          EvaluateTargetHealth: false
        }
    },
    {
      Name: 'apple.dev-internal.yoursite.com',
      Type: 'A',
      SetIdentifier: 'ap-northeast-2 ALB',
      Region: 'ap-northeast-2',
      ResourceRecords: [],
      AliasTarget:
        {
          HostedZoneId: 'lalala2',
          DNSName: 'magic.dns.name',
          EvaluateTargetHealth: false
        }
    },
    {
      Name: 'apple.dev-internal.yoursite.com',
      Type: 'AAAA',
      SetIdentifier: 'SIP API Load balancer',
      Region: 'us-west-2',
      ResourceRecords: [],
      AliasTarget:
        {
          HostedZoneId: 'lalala',
          DNSName: 'magic.dns.name2',
          EvaluateTargetHealth: false
        }
    },
    {
      Name: 'apple.dev-internal.yoursite.com',
      Type: 'AAAA',
      SetIdentifier: 'ap-northeast-2 ALB',
      Region: 'ap-northeast-2',
      ResourceRecords: [],
      AliasTarget:
        {
          HostedZoneId: 'lalala2',
          DNSName: 'magic.dns.name',
          EvaluateTargetHealth: false
        }
    }];
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getter _awsRoute53Client', () => {
    it('should pass accessKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: sandbox.stub()

      };

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53(accessKey, secretKey, region);


      //Act
      route53ClientService._awsRoute53Client;

      //Assert
      let params = mockAwsSdk.Route53.args[0][0];
      expect(params).to.have.property('accessKeyId', accessKey);
    });

    it('should pass secretKey to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: sandbox.stub()

      };

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53(accessKey, secretKey, region);


      //Act
      route53ClientService._awsRoute53Client;

      //Assert
      let params = mockAwsSdk.Route53.args[0][0];
      expect(params).to.have.property('secretAccessKey', secretKey);
    });

    it('should pass region to client', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: sandbox.stub()

      };

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53(accessKey, secretKey, region);


      //Act
      route53ClientService._awsRoute53Client;

      //Assert
      let params = mockAwsSdk.Route53.args[0][0];
      expect(params).to.have.property('region', region);
    });

    it('should pass default region of us-west-2 if none specified', () => {
      //Arrange
      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: sandbox.stub()

      };

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53(accessKey, secretKey);


      //Act
      route53ClientService._awsRoute53Client;

      //Assert
      let params = mockAwsSdk.Route53.args[0][0];
      expect(params).to.have.property('region', 'us-west-2');
    });
  });

  describe('_getHostedZoneIdFromDomainName', () => {
    it('should pass return HostedZoneId for matching domain name', () => {
      //Arrange
      let listHostedZonesByNameResponse = {
        "HostedZones": [{
          "Id": "/hostedzone/ZEN3HS1JKMCNO",
          "Name": "ascensioninnovation.com.",
          "CallerReference": "82565BD6-088C-CCDE-9095-E64FA8C479DE",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 4
        }, {
          "Id": "/hostedzone/Z1I6AZ5ULRL1U6",
          "Name": "barleyprize.com.",
          "CallerReference": "62B5042E-8F1F-9BEF-9B02-B4FD487A6DB5",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 7
        }, {
          "Id": "/hostedzone/Z13J8T9LEUCQ7S",
          "Name": "yoursite1.com.",
          "CallerReference": "3028E821-6BE2-C16F-A791-0005402AA87E",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 72
        }, {
          "Id": "/hostedzone/Z3AINN1K0A5DVI",
          "Name": "goverbu.com.",
          "CallerReference": "727A9EA3-44BB-E6D3-8C1E-F147513FF369",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 4
        }, {
          "Id": "/hostedzone/Z1B962C4LBOV2",
          "Name": "inclusionplus.com.",
          "CallerReference": "D449E432-DB99-7B39-80DD-0D34FDAE7E01",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 11
        }, {
          "Id": "/hostedzone/Z2X4VJX8T8RVLO",
          "Name": "newwaycc.com.",
          "CallerReference": "326FD626-D04D-F8EF-9C60-09247EFAF514",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 5
        }, {
          "Id": "/hostedzone/Z7K77SEGW3Z2Z",
          "Name": "newwaylp.com.",
          "CallerReference": "DF814E32-7036-F03C-9AAD-6C7FF944C38E",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 5
        }, {
          "Id": "/hostedzone/Z3T6V4B29RDTZ3",
          "Name": "newwayow.com.",
          "CallerReference": "ED7638BD-770F-EEF6-83C4-8A47ED2C9DAA",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 5
        }, {
          "Id": "/hostedzone/Z1YJ78W8927CNW",
          "Name": "newwaysp.com.",
          "CallerReference": "4F6F833A-78A0-EB56-B6BE-CC48D5ABACEE",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 7
        }, {
          "Id": "/hostedzone/Z5IXHA12XAQ5X",
          "Name": "newwaysr.com.",
          "CallerReference": "F62422A1-C90D-5F12-9FCD-698E14B0F449",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 5
        }, {
          "Id": "/hostedzone/Z3M7IL8JSOWGNV",
          "Name": "newwaytostartup.com.",
          "CallerReference": "5E28946D-8DD6-2F9D-9F5C-A3F10EABACD1",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 5
        }, {
          "Id": "/hostedzone/Z1PJUNE0O0S76K",
          "Name": "yoursite2.com.",
          "CallerReference": "C55A8461-F513-A2FF-A7E2-9DB576D169FA",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 8
        }, {
          "Id": "/hostedzone/Z13N6CM2I15284",
          "Name": "goverb.org.",
          "CallerReference": "7D4DC180-1D42-8A26-86E0-AB0754F7EAD6",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 4
        }, {
          "Id": "/hostedzone/Z155FA63YXRCQL",
          "Name": "verb.vc.",
          "CallerReference": "4E24B127-9357-FC70-B282-F678DF61B003",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 2
        }, {
          "Id": "/hostedzone/Z2IK7KF5FEIWCJ",
          "Name": "clearly.world.",
          "CallerReference": "0B2BCDC9-9ABA-62F6-BFA4-3E5A5417DC6F",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 3
        }, {
          "Id": "/hostedzone/Z1ZC0ZZPG6CLZT",
          "Name": "mars.clearly.world.",
          "CallerReference": "0D45CCB7-B800-02FF-ABED-1E5887DBD2FA",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 2
        }], "IsTruncated": false, "MaxItems": "100"
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        listHostedZonesByName: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listHostedZonesByNameResponse);
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };

      const domainName = 'apple.dev-internal.yoursite2.com';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      //Act
      let resultPromise = route53ClientService._getHostedZoneIdFromDomainName(domainName);

      //Assert
      return resultPromise.then(domainHostedZoneId => {
        expect(domainHostedZoneId).to.be.equal('/hostedzone/Z1PJUNE0O0S76K');
      });
    });
  });

  describe('associateDomainWithApplicationLoadBalancer', () => {
    it('should pass domainName to _getHostedZoneIdFromDomainName function', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      let createHealthCheckResp = {
        HealthCheck: {
          Id: 'randomId'
        }
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        createHealthCheck: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createHealthCheckResp);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => { } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._isResourceRecordSame = sandbox.stub().returns(false);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName, '');


      //Assert
      return resultPromise.then(() => {
        expect(route53ClientService._getHostedZoneIdFromDomainName.args[0][0]).to.be.equal(domainName);
      });
    });

    it('should pass HostedZoneId from domainName lookup to changeResourceRecordSet', () => {
      //Arrange
        let changeResourceRecordSetsResponse = {
          ChangeInfo: {
            Id: '/change/C1NA97N1YR2S8Q',
            Status: 'PENDING',
            SubmittedAt: '2016-12-16T17:42:11.592Z'
          }
        };

        let createHealthCheckResp = {
          HealthCheck: {
            Id: 'randomId'
          }
        };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        createHealthCheck: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createHealthCheckResp);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._isResourceRecordSame = sandbox.stub().returns(false);


      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName, '');

      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.changeResourceRecordSets.args[0][0]).to.have.property('HostedZoneId', 'APPLESAUCE');
      });

    });

    it('should not call changeResourceRecordSets if there is no change', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      let createHealthCheckResp = {
        HealthCheck: {
          Id: 'randomId'
        }
      };

      let healthCheckTags = {
        ResourceTagSets: [
          {
            Tags: [
              { Key: 'Name', Value: 'ugh' }
            ]
          }
        ]
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        createHealthCheck: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createHealthCheckResp);
          }
        }),
        listTagsForResources: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(healthCheckTags);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => { } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function () {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._doResourceRecordsHaveHealthCheck = sandbox.stub().resolves(true);
      route53ClientService._isResourceRecordSame = sandbox.stub().returns(true);


      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName);
      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.changeResourceRecordSets.callCount).to.be.equal(0);
      });

    });

    it('should pass all Changes to changeResourceRecordSet', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      let createHealthCheckResp = {
        HealthCheck: {
          Id: 'randomId'
        }
      };

      let healthCheckTags = {
        ResourceTagSets: [
          {
            Tags: [
              { Key: 'Name', Value: 'ugh' }
            ]
          }
        ]
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        createHealthCheck: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createHealthCheckResp);
          }
        }),
        listTagsForResources: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(healthCheckTags);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => { } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(recordSets);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._doResourceRecordsHaveHealthCheck = sandbox.stub().resolves(true);
      route53ClientService._isResourceRecordSame = sandbox.stub().returns(false);


      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName);

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(4);
      });
    });

    it('should pass pass A Record to changeResourceRecordSet', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      let createHealthCheckResp = {
        HealthCheck: {
          Id: 'randomId'
        }
      };

      let healthCheckTags = {
        ResourceTagSets: [
          {
            Tags: [
              { Key: 'Name', Value: 'ugh' }
            ]
          }
        ]
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        createHealthCheck: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createHealthCheckResp);
          }
        }),
        changeTagsForResource: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve();
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => { } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';
      const ELB_DNSName = 'magic.dns.name2';
      const ELB_HostedZone = 'lalala';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(recordSets);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._doResourceRecordsHaveHealthCheck = sandbox.stub().resolves(true);
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);
      route53ClientService._doesHealthCheckAlreadyExist = sandbox.stub().resolves(false);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName, ELB_DNSName, ELB_HostedZone, '/');

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(4);

        let changes = changeBatch.Changes;

        expect(changes[2]).to.have.property('Action', 'UPSERT');
        expect(changes[2]).to.have.nested.property('ResourceRecordSet.Name', domainName);
        expect(changes[2]).to.have.nested.property('ResourceRecordSet.Type', 'A');
        expect(changes[2]).to.have.nested.property('ResourceRecordSet.AliasTarget.DNSName', ELB_DNSName);
        expect(changes[2]).to.have.nested.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', true);
        expect(changes[2]).to.have.nested.property('ResourceRecordSet.AliasTarget.HostedZoneId', ELB_HostedZone);
        expect(changes[2]).to.have.nested.property('ResourceRecordSet.HealthCheckId', createHealthCheckResp.HealthCheck.Id);

        expect(changes[3]).to.have.property('Action', 'UPSERT');
        expect(changes[3]).to.have.nested.property('ResourceRecordSet.Name', domainName);
        expect(changes[3]).to.have.nested.property('ResourceRecordSet.Type', 'AAAA');
        expect(changes[3]).to.have.nested.property('ResourceRecordSet.HealthCheckId', createHealthCheckResp.HealthCheck.Id);
        expect(changes[3]).to.have.nested.property('ResourceRecordSet.AliasTarget.DNSName', ELB_DNSName);
        expect(changes[3]).to.have.nested.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', true);
        expect(changes[3]).to.have.nested.property('ResourceRecordSet.AliasTarget.HostedZoneId', ELB_HostedZone);
      });
    });

    it('should pass AAAA Record to changeResourceRecordSet', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      let createHealthCheckResp = {
        HealthCheck: {
          Id: 'randomId'
        }
      };


      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        createHealthCheck: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(createHealthCheckResp);
          }
        }),
        changeTagsForResource: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve();
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => { } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';
      const ELB_DNSName = 'magic.dns.name2';
      const ELB_HostedZone = 'lalala';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(recordSets);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._doResourceRecordsHaveHealthCheck = sandbox.stub().resolves(true);
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);
      route53ClientService._doesHealthCheckAlreadyExist = sandbox.stub().resolves(false);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName, ELB_DNSName, ELB_HostedZone, '/');

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(4);

        let changes = changeBatch.Changes;

        const INDEX1 = 2;
        expect(changes[INDEX1]).to.have.property('Action', 'UPSERT');
        expect(changes[INDEX1]).to.have.nested.property('ResourceRecordSet.Name', domainName);
        expect(changes[INDEX1]).to.have.nested.property('ResourceRecordSet.Type', 'A');
        expect(changes[INDEX1]).to.have.nested.property('ResourceRecordSet.HealthCheckId', createHealthCheckResp.HealthCheck.Id);
        expect(changes[INDEX1]).to.have.nested.property('ResourceRecordSet.AliasTarget.DNSName', ELB_DNSName);
        expect(changes[INDEX1]).to.have.nested.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', true);
        expect(changes[INDEX1]).to.have.nested.property('ResourceRecordSet.AliasTarget.HostedZoneId', ELB_HostedZone);

        const INDEX2 = 3;
        expect(changes[INDEX2]).to.have.property('Action', 'UPSERT');
        expect(changes[INDEX2]).to.have.nested.property('ResourceRecordSet.Name', domainName);
        expect(changes[INDEX2]).to.have.nested.property('ResourceRecordSet.Type', 'AAAA');
        expect(changes[INDEX2]).to.have.nested.property('ResourceRecordSet.HealthCheckId', createHealthCheckResp.HealthCheck.Id);
        expect(changes[INDEX2]).to.have.nested.property('ResourceRecordSet.AliasTarget.DNSName', ELB_DNSName);
        expect(changes[INDEX2]).to.have.nested.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', true);
        expect(changes[INDEX2]).to.have.nested.property('ResourceRecordSet.AliasTarget.HostedZoneId', ELB_HostedZone);

      });
    });

    it('should pass result Id into waitFor function', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      let createHealthCheckResp = {
        HealthCheck: {
          Id: 'randomId'
        }
      };

      let healthCheckTags = {
        ResourceTagSets: [
          {
            Tags: [
              { Key: 'Name', Value: 'ugh' }
            ]
          }
        ]
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => { } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._doResourceRecordsHaveHealthCheck = sandbox.stub().resolves(true);
      route53ClientService._isResourceRecordSame = sandbox.stub().returns(false);


      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName);

      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.waitFor.args[0][0]).to.be.equal('resourceRecordSetsChanged');
        expect(awsRoute53Mock.waitFor.args[0][1]).to.have.property('Id', changeResourceRecordSetsResponse.ChangeInfo.Id);
      });

    });
    it('should not create health check if health check resource path is not provided', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      let createHealthCheckResp = {
        HealthCheck: {
          Id: 'randomId'
        }
      };

      let healthCheckTags = {
        ResourceTagSets: [
          {
            Tags: [
              { Key: 'Name', Value: 'ugh' }
            ]
          }
        ]
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => { } })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function () {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';
      const ELB_DNSName = 'magic.dns.name';
      const ELB_HostedZone = 'safjdkaslfjdas';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._createHealthCheck = sandbox.stub().resolves();
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._doResourceRecordsHaveHealthCheck = sandbox.stub().resolves(true);
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);
      route53ClientService._doesHealthCheckAlreadyExist = sandbox.stub().resolves(false);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName, ELB_DNSName, ELB_HostedZone);

      //Assert
      return resultPromise.then(() => {
        expect(route53ClientService._createHealthCheck.callCount).to.equal(0);
      });
    });
  });

  describe('associateDomainWithCloudFront', () => {

    // This is a hardcoded AWS CloudFront Value
    const CLOUDFRONT_HOSTED_ZONE_ID = 'Z2FDTNDATAQYW2';

    it('should pass domainName to _getHostedZoneIdFromDomainName function', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves();
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName);

      //Assert
      return resultPromise.then(() => {
        expect(route53ClientService._getHostedZoneIdFromDomainName.args[0][0]).to.be.equal(domainName);
      });
    });

    it('should pass HostedZoneId from domainName lookup to changeResourceRecordSet', () => {
      //Arrange
        let changeResourceRecordSetsResponse = {
          ChangeInfo: {
            Id: '/change/C1NA97N1YR2S8Q',
            Status: 'PENDING',
            SubmittedAt: '2016-12-16T17:42:11.592Z'
          }
        };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);
      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName);

      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.changeResourceRecordSets.args[0][0]).to.have.property('HostedZoneId', 'APPLESAUCE');
      });

    });

    it('should pass pass 2 Changes to changeResourceRecordSet', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName);

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(2);
      });
    });

    it('should pass pass A Record to changeResourceRecordSet', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';
      const cloudFrontDNSName = 'magic.dns.name';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName, cloudFrontDNSName);

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(2);

        let changes = changeBatch.Changes;

        expect(changes[0]).to.have.nested.property('Action', 'UPSERT');
        expect(changes[0]).to.have.nested.property('ResourceRecordSet.Name', domainName);
        expect(changes[0]).to.have.nested.property('ResourceRecordSet.Type', 'A');
        expect(changes[0]).to.have.nested.property('ResourceRecordSet.AliasTarget.DNSName', cloudFrontDNSName);
        expect(changes[0]).to.have.nested.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', false);
        expect(changes[0]).to.have.nested.property('ResourceRecordSet.AliasTarget.HostedZoneId', CLOUDFRONT_HOSTED_ZONE_ID);

      });
    });

    it('should pass pass AAAA Record to changeResourceRecordSet', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';
      const cloudFrontDNSName = 'magic.dns.name';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._doResourceRecordsHaveHealthCheck = sandbox.stub().resolves(true);
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName, cloudFrontDNSName);

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(2);

        let changes = changeBatch.Changes;

        expect(changes[1]).to.have.property('Action', 'UPSERT');
        expect(changes[1]).to.have.nested.property('ResourceRecordSet.Name', domainName);
        expect(changes[1]).to.have.nested.property('ResourceRecordSet.Type', 'AAAA');
        expect(changes[1]).to.have.nested.property('ResourceRecordSet.AliasTarget.DNSName', cloudFrontDNSName);
        expect(changes[1]).to.have.nested.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', false);
        expect(changes[1]).to.have.nested.property('ResourceRecordSet.AliasTarget.HostedZoneId', CLOUDFRONT_HOSTED_ZONE_ID);

      });
    });

    it('should pass result Id into waitFor function', () => {
      //Arrange
      let changeResourceRecordSetsResponse = {
        ChangeInfo: {
          Id: '/change/C1NA97N1YR2S8Q',
          Status: 'PENDING',
          SubmittedAt: '2016-12-16T17:42:11.592Z'
        }
      };

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse);
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const domainName = 'apple.dev-internal.yoursite.com';

            const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);
      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._doResourceRecordsHaveHealthCheck = sandbox.stub().resolves(true);
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName);

      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.waitFor.args[0][0]).to.be.equal('resourceRecordSetsChanged');
        expect(awsRoute53Mock.waitFor.args[0][1]).to.have.property('Id', changeResourceRecordSetsResponse.ChangeInfo.Id);
      });

    });
  });

  describe('_getHostedZoneNameFromDomainName', () => {
    it('should parse simple host.tld into correct hostedZoneName', (done) => {
      //Arrange
      let expected = 'example.com';
      let input = 'example.com';

      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53(accessKey, secretKey, region);

      //Act
      let actual = route53ClientService._getHostedZoneNameFromDomainName(input);

      //Assert
      expect(actual).to.be.equal(expected);
      done();
    });

    it('should parse simple apple.host.tld into correct hostedZoneName', (done) => {
      //Arrange
      let expected = 'example.com';
      let input = 'apple.example.com';

      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53(accessKey, secretKey, region);

      //Act
      let actual = route53ClientService._getHostedZoneNameFromDomainName(input);

      //Assert
      expect(actual).to.be.equal(expected);
      done();
    });

    it('should parse simple blanket.apple.host.tld into correct hostedZoneName', (done) => {
      //Arrange
      let expected = 'example.com';
      let input = 'blanket.apple.example.com';

      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53(accessKey, secretKey, region);

      //Act
      let actual = route53ClientService._getHostedZoneNameFromDomainName(input);

      //Assert
      expect(actual).to.be.equal(expected);
      done();
    });

    it('should throw error if host is passed in without tld', (done) => {
      //Arrange
      let expected = 'example.com';
      let input = 'example';

      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53(accessKey, secretKey, region);

      //Act & Assert
      try {
        let actual = route53ClientService._getHostedZoneNameFromDomainName(input);
      } catch (err) {
        //Assert
        expect(err.message).to.be.equal(`Invalid domainName to split.  Expected a value with *.{host}.{tld} and received ${input}`);
      }
      done();
    });
  });

  describe('_getResourceRecordSetsByName', () => {
    it('should pass hostedZoneId to listResourceRecordSets', () => {
      //Arrange

      const listResourceRecordSetResult = {"ResourceRecordSets":[{"Name":"dev.yoursite.com.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"dev.yoursite.com.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.yoursite.com.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.yoursite.com.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"yourapi.prod-internal.yoursite.com.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"app-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"yourapi.prod-internal.yoursite.com.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"app-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"wordpress.prod.yoursite.com.","Type":"A","TTL":300,"ResourceRecords":[{"Value":"35.167.2.48"}]},{"Name":"www.yoursite.com.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"www.yoursite.com.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}}],"IsTruncated":false,"MaxItems":"100"};

      //setting up awsRoute53Client Mock
      let awsRoute53Mock = {
        listResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listResourceRecordSetResult);
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      let hostedZoneId = 'Z1PJUNE0O0S76K';
      let dnsName = 'dev.yoursite.com';

      //Act
      let resultPromise = route53ClientService._getResourceRecordSetsByName(hostedZoneId, dnsName);


      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.listResourceRecordSets.args[0][0]).to.have.property('HostedZoneId', hostedZoneId);
      });
    });

    it('should pass dnsName to listResourceRecordSets', () => {
      //Arrange

      const listResourceRecordSetResult = {"ResourceRecordSets":[{"Name":"dev.yoursite.com.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"dev.yoursite.com.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.yoursite.com.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.yoursite.com.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"yourapi.prod-internal.yoursite.com.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"app-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"yourapi.prod-internal.yoursite.com.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"app-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"wordpress.prod.yoursite.com.","Type":"A","TTL":300,"ResourceRecords":[{"Value":"35.167.2.48"}]},{"Name":"www.yoursite.com.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"www.yoursite.com.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}}],"IsTruncated":false,"MaxItems":"100"};

      //setting up awsRoute53Client Mock
      let awsRoute53Mock = {
        listResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listResourceRecordSetResult);
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      let hostedZoneId = 'Z1PJUNE0O0S76K';
      let dnsName = 'dev.yoursite.com';

      //Act
      let resultPromise = route53ClientService._getResourceRecordSetsByName(hostedZoneId, dnsName);


      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.listResourceRecordSets.args[0][0]).to.have.property('StartRecordName', dnsName);
      });
    });

    it('should return the results that match the resource Name and region', () => {
      //Arrange

      const listResourceRecordSetResult = {
        "ResourceRecordSets":[
          {
            "Name":"dev.yoursite.com.",
            "Type":"A",
            "ResourceRecords":[],
            "Region": "us-west-2",
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d2gzlhvii4ajca.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"dev.yoursite.com.",
            "Type":"AAAA",
            "ResourceRecords":[],
            "Region": "us-west-2",
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d2gzlhvii4ajca.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"api.dev.yoursite.com.",
            "Type":"A","ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d2296tvo3hsqb0.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"api.dev.yoursite.com.",
            "Type":"AAAA",
            "ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d2296tvo3hsqb0.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"yourapi.prod-internal.yoursite.com.",
            "Type":"A","ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z1H1FL5HABSF5",
              "DNSName":"app-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"yourapi.prod-internal.yoursite.com.",
            "Type":"AAAA",
            "ResourceRecords":[],
            "AliasTarget":
              {
                "HostedZoneId":"Z1H1FL5HABSF5",
                "DNSName":"app-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.",
                "EvaluateTargetHealth":false
              }
            },
          {
            "Name":"wordpress.prod.yoursite.com.",
            "Type":"A",
            "TTL":300,
            "ResourceRecords":[
              {"Value":"35.167.2.48"
              }
            ]
          },
          {
            "Name":"www.yoursite.com.",
            "Type":"A","ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d1l7hx7of1tvg6.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"www.yoursite.com.",
            "Type":"AAAA",
            "ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d1l7hx7of1tvg6.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          }
        ],
        "IsTruncated":false,
        "MaxItems":"100"
      };

      //setting up awsRoute53Client Mock
      let awsRoute53Mock = {
        listResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listResourceRecordSetResult);
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      let hostedZoneId = 'Z1PJUNE0O0S76K';
      let dnsName = 'dev.yoursite.com';

      //Act
      let resultPromise = route53ClientService._getResourceRecordSetsByName(hostedZoneId, dnsName);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.have.length(2);
      });
    });

    it('should return the results that match the resource Name only if no region specified', () => {
      //Arrange

      const listResourceRecordSetResult = {
        "ResourceRecordSets":[
          {
            "Name":"dev.yoursite.com.",
            "Type":"A",
            "ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d2gzlhvii4ajca.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"dev.yoursite.com.",
            "Type":"AAAA",
            "ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d2gzlhvii4ajca.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"api.dev.yoursite.com.",
            "Type":"A","ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d2296tvo3hsqb0.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"api.dev.yoursite.com.",
            "Type":"AAAA",
            "ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d2296tvo3hsqb0.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"yourapi.prod-internal.yoursite.com.",
            "Type":"A","ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z1H1FL5HABSF5",
              "DNSName":"app-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"yourapi.prod-internal.yoursite.com.",
            "Type":"AAAA",
            "ResourceRecords":[],
            "AliasTarget":
              {
                "HostedZoneId":"Z1H1FL5HABSF5",
                "DNSName":"app-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.",
                "EvaluateTargetHealth":false
              }
          },
          {
            "Name":"wordpress.prod.yoursite.com.",
            "Type":"A",
            "TTL":300,
            "ResourceRecords":[
              {"Value":"35.167.2.48"
              }
            ]
          },
          {
            "Name":"www.yoursite.com.",
            "Type":"A","ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d1l7hx7of1tvg6.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          },
          {
            "Name":"www.yoursite.com.",
            "Type":"AAAA",
            "ResourceRecords":[],
            "AliasTarget": {
              "HostedZoneId":"Z2FDTNDATAQYW2",
              "DNSName":"d1l7hx7of1tvg6.cloudfront.net.",
              "EvaluateTargetHealth":false
            }
          }
        ],
        "IsTruncated":false,
        "MaxItems":"100"
      };

      //setting up awsRoute53Client Mock
      let awsRoute53Mock = {
        listResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listResourceRecordSetResult);
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function() {
          return awsRoute53Mock;
        }
      };


      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      let hostedZoneId = 'Z1PJUNE0O0S76K';
      let dnsName = 'dev.yoursite.com';

      //Act
      let resultPromise = route53ClientService._getResourceRecordSetsByName(hostedZoneId, dnsName);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.have.length(2);
      });
    });
  });


  describe('_doResourceRecordsHaveHealthCheck', () => {
    it('should return false if HealthCheckId does not exist in records', () => {
      // Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const records = [
        {
          "Name": "blah",
          "Type": "A",
          "SetIdentifier": "blah LB",
          "Region": "us-west-2",
          "ResourceRecords": [],
          "AliasTarget": {
            "HostedZoneId": "Z1H1FL5HABSF5",
            "DNSName": "lalala.elb.amazonaws.com.",
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "blah",
          "Type": "AAAA",
          "SetIdentifier": "blah LB",
          "Region": "us-west-2",
          "ResourceRecords": [],
          "AliasTarget": {
            "HostedZoneId": "Z1H1FL5HABSF5",
            "DNSName": "lalala.elb.amazonaws.com.",
            "EvaluateTargetHealth": false
          }
        }
      ];

      const dnsName = "lalala.elb.amazonaws.com";

      // Act
      const result = route53ClientService._doResourceRecordsHaveHealthCheck(records, dnsName);

      // Assert
      expect(result).to.equal(false);
    });

    it('should return false if HealthCheckId does exist in records', () => {
      // Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const records = [
        {
          "Name": "blah",
          "Type": "A",
          "SetIdentifier": "blah LB",
          "Region": "us-west-2",
          "HealthCheckId": "ramdomId",
          "ResourceRecords": [],
          "AliasTarget": {
            "HostedZoneId": "Z1H1FL5HABSF5",
            "DNSName": "lalala.elb.amazonaws.com.",
            "EvaluateTargetHealth": true
          }
        },
        {
          "Name": "blah",
          "Type": "AAAA",
          "SetIdentifier": "SIP API Loadbalancer",
          "Region": "us-west-2",
          "HealthCheckId": "ramdomId",
          "ResourceRecords": [],
          "AliasTarget": {
            "HostedZoneId": "Z1H1FL5HABSF5",
            "DNSName": "lalala.elb.amazonaws.com.",
            "EvaluateTargetHealth": true
          }
        }
      ];

      const dnsName = "lalala.elb.amazonaws.com";

      // Act
      const result = route53ClientService._doResourceRecordsHaveHealthCheck(records, dnsName);

      // Assert
      expect(result).to.equal(true);
    });
  });

  describe('_doesHealthCheckAlreadyExist', () => {
    it('should return healthCheckId of existing healthCheck if an existing healthCheck Name tag matches', async () => {
      //Arrange
      let healthCheckTags = {
        "ResourceTagSets": [
          {
            "ResourceType": "healthcheck",
            "ResourceId": "111",
            "Tags": [
              {
                "Key": "Name",
                "Value": "ugh - HealthCheck"
              }
            ]
          },
          {
            "ResourceType": "healthcheck",
            "ResourceId": "222",
            "Tags": [
              {
                "Key": "Name",
                "Value": "seton.uat.platform.goverb"
              }
            ]
          }
        ]
      };

      const healthCheckList = {
        HealthChecks: [
          { Id: '111'},
          { Id: '222'}
        ]
      };
      //setting up route53Client Mock
      let awsRoute53Mock = {
        listTagsForResources: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(healthCheckTags);
          }
        }),
        listHealthChecks: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(healthCheckList);
          },
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function () {
          return awsRoute53Mock;
        }
      };

      const domainName = 'ugh';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      // Act
      const result = await route53ClientService._doesHealthCheckAlreadyExist(domainName);

      // Assert
      expect(result).to.equal('111');
    });

    it('should return empty string if no healthCheck Name tag matches found', async () => {
      //Arrange
      let healthCheckTags = {
        "ResourceTagSets": [
          {
            "ResourceType": "healthcheck",
            "ResourceId": "111",
            "Tags": [
              {
                "Key": "Name",
                "Value": "notugh - HealthCheck"
              }
            ]
          },
          {
            "ResourceType": "healthcheck",
            "ResourceId": "222",
            "Tags": [
              {
                "Key": "Name",
                "Value": "seton.uat.platform.goverb"
              }
            ]
          }
        ]
      };

      const healthCheckList = {
        HealthChecks: [
          { Id: '111' },
          { Id: '222' }
        ]
      };
      //setting up route53Client Mock
      let awsRoute53Mock = {
        listTagsForResources: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(healthCheckTags);
          }
        }),
        listHealthChecks: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(healthCheckList);
          },
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: function () {
          return awsRoute53Mock;
        }
      };

      const domainName = 'ugh';

      const mocks = {
        'aws-sdk': mockAwsSdk
      };
      const Route53 = proxyquire('../src/route53Client', mocks);
      const route53ClientService = new Route53();

      // Act
      const result = await route53ClientService._doesHealthCheckAlreadyExist(domainName);

      // Assert
      expect(result).to.equal('');
    });
  });
});
