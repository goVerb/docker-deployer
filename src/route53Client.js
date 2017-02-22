const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BlueBirdPromise);

class Route53Client extends BaseClient {

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
    this.logMessage(`Starting associateDomainWithApplicationLoadBalancer. [DomainName: ${domainName}] [DNSName: ${dnsName}] [HostedZoneId: ${hostedZoneId}]`);

    //get hostedZoneID from domainName
    return this._getHostedZoneIdFromDomainName(domainName).then(domainHostedZoneId => {

      //check if any changes
      let parameters = {
        domainName: domainName,
        dnsName: dnsName,
        domainNameHostedZoneId: domainHostedZoneId
      };
      return this._hasResourceRecordSetChanged(parameters, hostedZoneId).then(result => {
        if (!result) {
          this.logMessage(`No Route53 changes need to be made.  No Action taken.`);
          return BlueBirdPromise.resolve();
        }
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
        return this._awsRoute53Client.changeResourceRecordSets(params).promise().then(result => {
          this.logMessage(`Result: ${JSON.stringify(result)}`);
          let params = {
            Id: result.ChangeInfo.Id
          };

          this.logMessage('Waiting for Route53 change to propagate');
          return this._awsRoute53Client.waitFor('resourceRecordSetsChanged', params).promise();
        }).then(() => {
          this.logMessage(`Change Propogated! [DomainName: ${domainName}]`);
        });
      });
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

      //check if any changes
      let parameters = {
        domainName: domainName,
        dnsName: cloudFrontDNSName,
        domainNameHostedZoneId: domainHostedZoneId
      };
      return this._hasResourceRecordSetChanged(parameters, CLOUDFRONT_HOSTED_ZONE_ID).then(result => {
        if (!result) {
          this.logMessage(`No Route53 changes need to be made.  No Action taken.`);
          return BlueBirdPromise.resolve();
        }

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
        return this._awsRoute53Client.changeResourceRecordSets(params).promise().then(result => {
          this.logMessage(`Result: ${JSON.stringify(result)}`);
          let params = {
            Id: result.ChangeInfo.Id
          };

          this.logMessage('Waiting for Route53 change to propagate');
          return this._awsRoute53Client.waitFor('resourceRecordSetsChanged', params).promise();
        }).then(() => {
          this.logMessage(`Change Propogated! [DomainName: ${domainName}]`);
        });
      });
    });

  }

  /**
   *
   * @param currentParameters
   * @param currentParameters.domainName
   * @param currentParameters.dnsName
   * @param currentParameters.domainNameHostedZoneId
   * @return {Promise.<bool>}
   * @private
   */
  _hasResourceRecordSetChanged(currentParameters, expectedAliasHostedZoneId) {

    return this._getResourceRecordSetsByName(currentParameters.domainNameHostedZoneId, currentParameters.domainName).then(results => {
      let hasChanged = false;

      const parsedExpectedAliasHostedZoneId = expectedAliasHostedZoneId.replace('/hostedzone/','');
      this.logMessage(`ParsedExpectedAliasHostedZoneId: ${parsedExpectedAliasHostedZoneId}`);

      let foundARecord = false;
      let foundAAAARecord = false;
      results.forEach(item => {

        //break if the true condition is met
        if(hasChanged) {
          return;
        }

        if(item.Type === 'A') {

          if(item.AliasTarget.HostedZoneId !== parsedExpectedAliasHostedZoneId) {
            this.logMessage(`A Record hostedZoneId has changed. [ExistingValue: ${item.AliasTarget.HostedZoneId}] [NewValue: ${parsedExpectedAliasHostedZoneId}]`);
            hasChanged = true;
          }

          if(item.AliasTarget.EvaluateTargetHealth !== false) {
            this.logMessage(`A Record EvaluateTargetHealth has changed. [ExistingValue: ${item.AliasTarget.EvaluateTargetHealth}] [NewValue: ${false}]`);
            hasChanged = true;
          }

          let formattedCurrentParamDnsName = __.get(currentParameters, 'dnsName', '').toLocaleUpperCase();
          let formattedExistingAliasTargetDNSName = __.get(item, 'AliasTarget.DNSName', '').toLocaleUpperCase();

          if(!formattedExistingAliasTargetDNSName.startsWith(formattedCurrentParamDnsName)) {
            this.logMessage(`A Record DNSName has changed. [ExistingValue: ${formattedExistingAliasTargetDNSName}] [NewValue: ${formattedCurrentParamDnsName}]`);
            hasChanged = true;
          }

          foundARecord = true;
        } else if (item.Type === 'AAAA') {

          if(item.AliasTarget.HostedZoneId !== parsedExpectedAliasHostedZoneId) {
            this.logMessage(`AAAA Record hostedZoneId has changed. [ExistingValue: ${item.AliasTarget.HostedZoneId}] [NewValue: ${parsedExpectedAliasHostedZoneId}]`);
            hasChanged = true;
          }

          if(item.AliasTarget.EvaluateTargetHealth !== false) {
            this.logMessage(`AAAA Record EvaluateTargetHealth has changed. [ExistingValue: ${item.AliasTarget.EvaluateTargetHealth}] [NewValue: ${false}]`);
            hasChanged = true;
          }

          let formattedCurrentParamDnsName = __.get(currentParameters, 'dnsName', '').toLocaleUpperCase();
          let formattedExistingAliasTargetDNSName = __.get(item, 'AliasTarget.DNSName', '').toLocaleUpperCase();

          if(!formattedExistingAliasTargetDNSName.startsWith(formattedCurrentParamDnsName)) {
            this.logMessage(`AAAA Record DNSName has changed. [ExistingValue: ${formattedExistingAliasTargetDNSName}] [NewValue: ${formattedCurrentParamDnsName}]`);
            hasChanged = true;
          }

          foundAAAARecord = true;
        } else {
          hasChanged = true;
        }
      });

      if(!foundARecord || !foundAAAARecord) {
        hasChanged = true;
      }


      console.log(hasChanged);
      return hasChanged;
    });

  }

  /**
   *
   * @param hostedZoneId
   * @param dnsName
   * @return {Promise.<TResult>}
   * @private
   */
  _getResourceRecordSetsByName(hostedZoneId, dnsName) {
    this.logMessage(`Starting _getResourceRecordSetsByName. [HostedZoneId: ${hostedZoneId}] [DnsName: ${dnsName}]`);
    const params = {
      HostedZoneId: hostedZoneId,
      StartRecordName: dnsName
    };

    const resultPromise = this._awsRoute53Client.listResourceRecordSets(params).promise();

    return resultPromise.then(results => {
      this.logMessage(`_getResourceRecordSetsByName Results: ${JSON.stringify(results)}`);
      return __.filter(results.ResourceRecordSets, (item) => {
        return __.get(item, 'Name', '').toLocaleUpperCase() === `${dnsName.toLocaleUpperCase()}.`;
      });
    });
  }

  /**
   *
   * @param domainName
   * @return {Promise.<TResult>}
   * @private
   */
  _getHostedZoneIdFromDomainName(domainName) {
    this.logMessage(`Starting _getHostedZoneIdFromDomainName. [DomainName: ${domainName}]`);

    let parsedHostName = this._getHostedZoneNameFromDomainName(domainName);
    let params = {};
    let listHostedZonesByNamePromise = this._awsRoute53Client.listHostedZonesByName(params).promise();


    this.logMessage(`Looking up HostedZones by Name. [ParsedHostName: ${parsedHostName}]`);
    return listHostedZonesByNamePromise.then(result => {
      this.logMessage(`Looking up HostedZones by Name. [Results: ${JSON.stringify(result)}]`);
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

}

module.exports = Route53Client;
