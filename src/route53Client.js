const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

AWS.config.setPromisesDependency(BlueBirdPromise);

class Route53Client {

  constructor(accessKey = '', secretKey = '', region = 'us-west-2') {

    this._accessKey = accessKey;
    this._secretKey = secretKey;
    this._region = region;
  }

  get _awsRoute53Client() {

    if (!this._internalRoute53Client) {
      let params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2013-04-01',
        region: this._region
      };
      this._internalRoute53Client = new AWS.Route53(params);
    }

    return this._internalRoute53Client;
  }

  /**
   *
   * @param domainName
   * @param dnsName
   * @param hostedZoneId
   * @return {Promise.<TResult>}
   */
  associateDomainWithApplicationLoadBalancer(domainName, dnsName, hostedZoneId) {

    //get hostedZoneID from domainName
    return this._getHostedZoneIdFromDomainName(domainName).then(domainHostedZoneId => {
      let params = {
        HostedZoneId: domainHostedZoneId,
        ChangeBatch: {
          Changes: [
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: domainName,
                Type: 'A',
                AliasTarget: {
                  DNSName: dnsName,
                  EvaluateTargetHealth: false,
                  HostedZoneId: hostedZoneId
                }
              }
            },
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: domainName,
                Type: 'AAAA',
                AliasTarget: {
                  DNSName: dnsName,
                  EvaluateTargetHealth: false,
                  HostedZoneId: hostedZoneId
                }
              }
            }
          ]
        }
      };

      this.logMessage(`Associating Domain with Application Load Balancer. [DomainName: ${domainName}]`);
      return this._awsRoute53Client.changeResourceRecordSets(params).promise();
    }).then(result => {
      this.logMessage(`Result: ${JSON.stringify(result)}`);
      let params = {
        Id: result.ChangeInfo.Id
      };

      this.logMessage('Waiting for Route53 change to propagate');
      return this._awsRoute53Client.waitFor('resourceRecordSetsChanged', params).promise();
    }).then(() => {
      this.logMessage(`Change Propogated! [DomainName: ${domainName}]`);
    });

  }
  
  /**
   *
   * @param domainName
   * @param dnsName
   * @param hostedZoneId
   * @return {Promise.<TResult>}
   */
  associateDomainWithCloudFront(domainName, cloudFrontDNSName) {
    
    // This is a hardcoded AWS CloudFront Value
    const CLOUDFRONT_HOSTED_ZONE_ID = 'Z2FDTNDATAQYW2';

    //get hostedZoneID from domainName
    return this._getHostedZoneIdFromDomainName(domainName).then(domainHostedZoneId => {
      let params = {
        HostedZoneId: domainHostedZoneId,
        ChangeBatch: {
          Changes: [
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: domainName,
                Type: 'A',
                AliasTarget: {
                  DNSName: cloudFrontDNSName,
                  EvaluateTargetHealth: false,
                  HostedZoneId: CLOUDFRONT_HOSTED_ZONE_ID
                }
              }
            },
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: domainName,
                Type: 'AAAA',
                AliasTarget: {
                  DNSName: cloudFrontDNSName,
                  EvaluateTargetHealth: false,
                  HostedZoneId: CLOUDFRONT_HOSTED_ZONE_ID
                }
              }
            }
          ]
        }
      };

      this.logMessage(`Associating Domain with CloudFront. [DomainName: ${domainName}]`);
      return this._awsRoute53Client.changeResourceRecordSets(params).promise();
    }).then(result => {
      this.logMessage(`Result: ${JSON.stringify(result)}`);
      let params = {
        Id: result.ChangeInfo.Id
      };

      this.logMessage('Waiting for Route53 change to propagate');
      return this._awsRoute53Client.waitFor('resourceRecordSetsChanged', params).promise();
    }).then(() => {
      this.logMessage(`Change Propogated! [DomainName: ${domainName}]`);
    });

  }

  /**
   *
   * @param domainName
   * @return {Promise.<TResult>}
   * @private
   */
  _getHostedZoneIdFromDomainName(domainName) {

    let parsedHostName = this._getHostedZoneNameFromDomainName(domainName);
    let params = {};
    let listHostedZonesByNamePromise = this._awsRoute53Client.listHostedZonesByName(params).promise();


    this.logMessage(`Looking up HostedZones by Name. [ParsedHostName: ${parsedHostName}]`);
    return listHostedZonesByNamePromise.then(result => {
      let resultHostedZoneId = '';
      if(result && result.HostedZones && result.HostedZones.length > 0) {
        //find hostedZones that match the
        let matchingHostedZones = __.filter(result.HostedZones, (hostedZone) =>  {
          return hostedZone.Name.startsWith(parsedHostName);
        });

        if(matchingHostedZones && matchingHostedZones.length > 0) {
          resultHostedZoneId = matchingHostedZones[0].Id;
        }

      }

      return resultHostedZoneId;
    });
  }

  /**
   *
   * @param domainName
   * @return {string}
   * @private
   */
  _getHostedZoneNameFromDomainName(domainName) {

    let domainNameSplit = domainName.split('.');
    if(domainNameSplit.length < 2) {
      let errorMessage = `Invalid domainName to split.  Expected a value with *.{host}.{tld} and received ${domainName}`;
      this.logMessage(errorMessage);
      throw new Error(errorMessage);
    }

    let hostAndTld = __.slice(domainNameSplit, domainNameSplit.length - 2, domainNameSplit.length);

    return hostAndTld.join('.');
  }

  /**
   * Logs messages
   * @param msg
   */
  logMessage(msg) {
    console.log(msg);
  }

}

module.exports = Route53Client;
