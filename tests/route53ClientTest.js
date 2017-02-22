const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const mockery = require('mockery');
const __ = require('lodash');
const BluebirdPromise = require('bluebird');


require('sinon-as-promised');
chai.use(chaiAsPromised);


describe('Route53 Client', function () {
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
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Route53 = require('../src/route53Client');
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
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Route53 = require('../src/route53Client');
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
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Route53 = require('../src/route53Client');
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
      mockery.registerMock('aws-sdk', mockAwsSdk);

      //Setting up ELB clients
      const accessKey = 'acckey';
      const secretKey = 'secret';
      const region = 'us-west-3';

      const Route53 = require('../src/route53Client');
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
          "Name": "go***REMOVED***.com.",
          "CallerReference": "3028E821-6BE2-C16F-A791-0005402AA87E",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 72
        }, {
          "Id": "/hostedzone/Z3AINN1K0A5DVI",
          "Name": "go***REMOVED***u.com.",
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
          "Name": "***REMOVED***.net.",
          "CallerReference": "C55A8461-F513-A2FF-A7E2-9DB576D169FA",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 8
        }, {
          "Id": "/hostedzone/Z13N6CM2I15284",
          "Name": "go***REMOVED***.org.",
          "CallerReference": "7D4DC180-1D42-8A26-86E0-AB0754F7EAD6",
          "Config": {"PrivateZone": false},
          "ResourceRecordSetCount": 4
        }, {
          "Id": "/hostedzone/Z155FA63YXRCQL",
          "Name": "***REMOVED***.vc.",
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
            return BluebirdPromise.resolve(listHostedZonesByNameResponse)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
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

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves();
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(false);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName);


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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName);

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

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(false);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName);

      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.changeResourceRecordSets.callCount).to.be.equal(0);
      });

    });

    it('should pass _getHostedZoneIdFromDomainName result to _hasResourceRecordSetChanged', () => {
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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(false);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName);

      //Assert
      return resultPromise.then(() => {
        expect(route53ClientService._hasResourceRecordSetChanged.args[0][0]).to.have.property('domainNameHostedZoneId', 'APPLESAUCE');
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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName);

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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';
      const ELB_DNSName = 'magic.dns.name';
      const ELB_HostedZone = 'safjdkaslfjdas';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName, ELB_DNSName, ELB_HostedZone);

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(2);

        let changes = changeBatch.Changes;

        expect(changes[0]).to.have.deep.property('Action', 'UPSERT');
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.Name', domainName);
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.Type', 'A');
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.AliasTarget.DNSName', ELB_DNSName);
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', false);
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.AliasTarget.HostedZoneId', ELB_HostedZone);

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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';
      const ELB_DNSName = 'magic.dns.name';
      const ELB_HostedZone = 'safjdkaslfjdas';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName, ELB_DNSName, ELB_HostedZone);

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(2);

        let changes = changeBatch.Changes;

        expect(changes[1]).to.have.deep.property('Action', 'UPSERT');
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.Name', domainName);
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.Type', 'AAAA');
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.AliasTarget.DNSName', ELB_DNSName);
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', false);
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.AliasTarget.HostedZoneId', ELB_HostedZone);

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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithApplicationLoadBalancer(domainName);

      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.waitFor.args[0][0]).to.be.equal('resourceRecordSetsChanged');
        expect(awsRoute53Mock.waitFor.args[0][1]).to.have.property('Id', changeResourceRecordSetsResponse.ChangeInfo.Id);
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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves();
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(false);

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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName);

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

      //setting up route53Client Mock
      let awsRoute53Mock = {
        changeResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(false);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName);

      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.changeResourceRecordSets.callCount).to.be.equal(0);
      });

    });

    it('should pass _getHostedZoneIdFromDomainName result to _hasResourceRecordSetChanged', () => {
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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(false);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName);

      //Assert
      return resultPromise.then(() => {
        expect(route53ClientService._hasResourceRecordSetChanged.args[0][0]).to.have.property('domainNameHostedZoneId', 'APPLESAUCE');
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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';
      const cloudFrontDNSName = 'magic.dns.name';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName, cloudFrontDNSName);

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(2);

        let changes = changeBatch.Changes;

        expect(changes[0]).to.have.deep.property('Action', 'UPSERT');
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.Name', domainName);
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.Type', 'A');
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.AliasTarget.DNSName', cloudFrontDNSName);
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', false);
        expect(changes[0]).to.have.deep.property('ResourceRecordSet.AliasTarget.HostedZoneId', CLOUDFRONT_HOSTED_ZONE_ID);

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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';
      const cloudFrontDNSName = 'magic.dns.name';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
      route53ClientService._hasResourceRecordSetChanged = sandbox.stub().resolves(true);

      //Act
      let resultPromise = route53ClientService.associateDomainWithCloudFront(domainName, cloudFrontDNSName);

      //Assert
      return resultPromise.then(() => {
        let changeBatch = awsRoute53Mock.changeResourceRecordSets.args[0][0].ChangeBatch;
        expect(changeBatch.Changes).to.have.length(2);

        let changes = changeBatch.Changes;

        expect(changes[1]).to.have.deep.property('Action', 'UPSERT');
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.Name', domainName);
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.Type', 'AAAA');
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.AliasTarget.DNSName', cloudFrontDNSName);
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.AliasTarget.EvaluateTargetHealth', false);
        expect(changes[1]).to.have.deep.property('ResourceRecordSet.AliasTarget.HostedZoneId', CLOUDFRONT_HOSTED_ZONE_ID);

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
            return BluebirdPromise.resolve(changeResourceRecordSetsResponse)
          }
        }),
        waitFor: sandbox.stub().returns({ promise: () => {} })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const domainName = 'apple.dev-internal.***REMOVED***.net';

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getHostedZoneIdFromDomainName = sandbox.stub().resolves('APPLESAUCE');
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

      const listResourceRecordSetResult = {"ResourceRecordSets":[{"Name":"dev.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"dev.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"***REMOVED***api.prod-internal.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"***REMOVED***-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"***REMOVED***api.prod-internal.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"***REMOVED***-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"wordpress.prod.***REMOVED***.net.","Type":"A","TTL":300,"ResourceRecords":[{"Value":"35.167.2.48"}]},{"Name":"www.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"www.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}}],"IsTruncated":false,"MaxItems":"100"};

      //setting up awsRoute53Client Mock
      let awsRoute53Mock = {
        listResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listResourceRecordSetResult)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      let hostedZoneId = 'Z1PJUNE0O0S76K';
      let dnsName = 'dev.***REMOVED***.net';

      //Act
      let resultPromise = route53ClientService._getResourceRecordSetsByName(hostedZoneId, dnsName);


      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.listResourceRecordSets.args[0][0]).to.have.property('HostedZoneId', hostedZoneId);
      });
    });

    it('should pass dnsName to listResourceRecordSets', () => {
      //Arrange

      const listResourceRecordSetResult = {"ResourceRecordSets":[{"Name":"dev.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"dev.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"***REMOVED***api.prod-internal.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"***REMOVED***-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"***REMOVED***api.prod-internal.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"***REMOVED***-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"wordpress.prod.***REMOVED***.net.","Type":"A","TTL":300,"ResourceRecords":[{"Value":"35.167.2.48"}]},{"Name":"www.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"www.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}}],"IsTruncated":false,"MaxItems":"100"};

      //setting up awsRoute53Client Mock
      let awsRoute53Mock = {
        listResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listResourceRecordSetResult)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      let hostedZoneId = 'Z1PJUNE0O0S76K';
      let dnsName = 'dev.***REMOVED***.net';

      //Act
      let resultPromise = route53ClientService._getResourceRecordSetsByName(hostedZoneId, dnsName);


      //Assert
      return resultPromise.then(() => {
        expect(awsRoute53Mock.listResourceRecordSets.args[0][0]).to.have.property('StartRecordName', dnsName);
      });
    });

    it('should return the results that match the resource Name', () => {
      //Arrange

      const listResourceRecordSetResult = {"ResourceRecordSets":[{"Name":"dev.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"dev.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2gzlhvii4ajca.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"api.dev.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d2296tvo3hsqb0.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"***REMOVED***api.prod-internal.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"***REMOVED***-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"***REMOVED***api.prod-internal.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z1H1FL5HABSF5","DNSName":"***REMOVED***-ecs-app-load-balancer-prod-774817212.us-west-2.elb.amazonaws.com.","EvaluateTargetHealth":false}},{"Name":"wordpress.prod.***REMOVED***.net.","Type":"A","TTL":300,"ResourceRecords":[{"Value":"35.167.2.48"}]},{"Name":"www.***REMOVED***.net.","Type":"A","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}},{"Name":"www.***REMOVED***.net.","Type":"AAAA","ResourceRecords":[],"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"d1l7hx7of1tvg6.cloudfront.net.","EvaluateTargetHealth":false}}],"IsTruncated":false,"MaxItems":"100"};

      //setting up awsRoute53Client Mock
      let awsRoute53Mock = {
        listResourceRecordSets: sandbox.stub().returns({
          promise: () => {
            return BluebirdPromise.resolve(listResourceRecordSetResult)
          }
        })
      };

      let mockAwsSdk = {
        config: {
          setPromisesDependency: (promise) => {
          }
        },
        Route53: () => {
          return awsRoute53Mock;
        }
      };
      mockery.registerMock('aws-sdk', mockAwsSdk);

      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      let hostedZoneId = 'Z1PJUNE0O0S76K';
      let dnsName = 'dev.***REMOVED***.net';

      //Act
      let resultPromise = route53ClientService._getResourceRecordSetsByName(hostedZoneId, dnsName);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.have.length(2);
      });
    });

  });

  describe('_hasResourceRecordSetChanged', () => {
    it('should pass currentParameters.domainNameHostedZoneId to _getResourceRecordSetsByName', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);

      const currentParameters = {
        domainName: 'somethingUnique.***REMOVED***.net',
        dnsName: 'jfkldsjafjadskfljads.cloudfront.com',
        domainNameHostedZoneId: '***REMOVED***.nets hosted zone'
      };
      const expectedHostedZoneId = 'madeupexpectedhostedId';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);

      //Assert
      return resultPromise.then(() => {
        expect(route53ClientService._getResourceRecordSetsByName.args[0][0]).to.be.deep.equal(currentParameters.domainNameHostedZoneId);
      });
    });

    it('should pass currentParameters.domainName to _getResourceRecordSetsByName', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves([]);

      const currentParameters = {
        domainName: 'somethingUnique.***REMOVED***.net',
        dnsName: 'jfkldsjafjadskfljads.cloudfront.com',
        domainNameHostedZoneId: '***REMOVED***.nets hosted zone'
      };
      const expectedHostedZoneId = 'madeupexpectedhostedId';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);

      //Assert
      return resultPromise.then(() => {
        expect(route53ClientService._getResourceRecordSetsByName.args[0][1]).to.be.deep.equal(currentParameters.domainName);
      });
    });

    it('should return true if A record is missing', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'somethingUnique.***REMOVED***.net',
        dnsName: 'jfkldsjafjadskfljads.cloudfront.com',
        domainNameHostedZoneId: '***REMOVED***.nets hosted zone'
      };
      const expectedHostedZoneId = 'madeupexpectedhostedId';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.true;
      });
    });

    it('should return true if AAAA record is missing', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'somethingUnique.***REMOVED***.net',
        dnsName: 'd2gzlhvii4ajca.cloudfront.net',
        domainNameHostedZoneId: '***REMOVED***.nets hosted zone'
      };
      const expectedHostedZoneId = 'madeupexpectedhostedId';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.true;
      });
    });

    it('should return true if A record item.AliasTarget.HostedZoneId doesnt match the passed in value', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [],
          "AliasTarget": {
            "HostedZoneId": "asfdsaf",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        }];


      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: 'd2gzlhvii4ajca.cloudfront.net',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.true;
      });
    });

    it('should return true if AAAA record item.AliasTarget.HostedZoneId doesnt match the passed in value', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "1231321312",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: 'd2gzlhvii4ajca.cloudfront.net',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.true;
      });
    });

    it('should return true if A record item.AliasTarget.DNSName doesnt startWith currentparameters.dnsname', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "fsafdasfas.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: 'd2gzlhvii4ajca.cloudfront.net',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.true;
      });
    });

    it('should return true if AAAA record item.AliasTarget.DNSName doesnt startWith currentparameters.dnsname', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.fdsaf.net.",
            "EvaluateTargetHealth": false
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: 'd2gzlhvii4ajca.cloudfront.net',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.true;
      });
    });

    it('should return false if A record item.AliasTarget.DNSName doesnt startWith currentparameters.dnsname and has different casing', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "***REMOVED***-ecs-app-load-balancer-dev-840139107.us-west-2.elb.amazonaws.com.",
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": '***REMOVED***-ECS-App-Load-Balancer-Dev-840139107.us-west-2.elb.amazonaws.com',
            "EvaluateTargetHealth": false
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: '***REMOVED***-ECS-App-Load-Balancer-Dev-840139107.us-west-2.elb.amazonaws.com',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.false;
      });
    });

    it('should return false if AAAA record item.AliasTarget.DNSName startWith currentparameters.dnsname and has different casing', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": '***REMOVED***-ECS-App-Load-Balancer-Dev-840139107.us-west-2.elb.amazonaws.com.',
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "***REMOVED***-ecs-app-load-balancer-dev-840139107.us-west-2.elb.amazonaws.com.",
            "EvaluateTargetHealth": false
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: '***REMOVED***-ECS-App-Load-Balancer-Dev-840139107.us-west-2.elb.amazonaws.com',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.false;
      });
    });

    it('should return true if A record item.AliasTarget.EvaluateTargetHealth returns true', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": true
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: 'd2gzlhvii4ajca.cloudfront.net',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.true;
      });
    });

    it('should return true if AAAA record item.AliasTarget.EvaluateTargetHealth returns true', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": true
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: 'd2gzlhvii4ajca.cloudfront.net',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.true;
      });
    });

    it('should return true if other record besides A or AAAA record found', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "PTR",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": true
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: 'd2gzlhvii4ajca.cloudfront.net',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.true;
      });
    });

    it('should return false if no changes', () => {
      //Arrange
      const Route53 = require('../src/route53Client');
      const route53ClientService = new Route53();

      const results = [
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "A",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        },
        {
          "Name": "dev.***REMOVED***.net.",
          "Type": "AAAA",
          "ResourceRecords": [

          ],
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "d2gzlhvii4ajca.cloudfront.net.",
            "EvaluateTargetHealth": false
          }
        }];

      route53ClientService._getResourceRecordSetsByName = sandbox.stub().resolves(results);

      const currentParameters = {
        domainName: 'dev.***REMOVED***.net',
        dnsName: 'd2gzlhvii4ajca.cloudfront.net',
        domainNameHostedZoneId: '***REMOVED***.netshostedzone'
      };
      const expectedHostedZoneId = 'Z2FDTNDATAQYW2';

      //Act
      const resultPromise = route53ClientService._hasResourceRecordSetChanged(currentParameters, expectedHostedZoneId);


      //Assert
      return resultPromise.then(result => {
        expect(result).to.be.false;
      });
    });
  });
});
