const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
const uuid = require('uuid');

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
  async associateDomainWithApplicationLoadBalancer(domainName, dnsName, hostedZoneId, healthCheckResourcePath) {
    this.logMessage(`Starting associateDomainWithApplicationLoadBalancer. [DomainName: ${domainName}] [DNSName: ${dnsName}] [HostedZoneId: ${hostedZoneId}]`);

    //get hostedZoneID from domainName
    const domainHostedZoneId = await this._getHostedZoneIdFromDomainName(domainName);

    //check if any changes
    let parameters = {
      domainName: domainName,
      dnsName: dnsName,
      domainNameHostedZoneId: domainHostedZoneId
    };

    const hasRecordSetChangedResult = await this._hasResourceRecordSetChanged(parameters, hostedZoneId);
    if (!hasRecordSetChangedResult) {
      this.logMessage(`No Route53 changes need to be made.  No Action taken.`);
      return BlueBirdPromise.resolve();
    }
    const healthCheckData = await this._createHealthCheck(domainName, healthCheckResourcePath);
    let params = {
      HostedZoneId: domainHostedZoneId,
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              HealthCheckId: healthCheckData.HealthCheck.Id,
              Name: domainName,
              Region: this._region,
              SetIdentifier: `${this._region} ALB`,
              Type: 'A',
              AliasTarget: {
                DNSName: dnsName,
                EvaluateTargetHealth: true,
                HostedZoneId: hostedZoneId
              }
            }
          },
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              HealthCheckId: healthCheckData.HealthCheck.Id,
              Name: domainName,
              Region: this._region,
              SetIdentifier: `${this._region} ALB`,
              Type: 'AAAA',
              AliasTarget: {
                DNSName: dnsName,
                EvaluateTargetHealth: true,
                HostedZoneId: hostedZoneId
              }
            }
          }
        ]
      }
    };

    this.logMessage(`Associating Domain with Application Load Balancer. [DomainName: ${domainName}]`);

    const changeRecordSetsResult = await this._awsRoute53Client.changeResourceRecordSets(params).promise();
    this.logMessage(`Result: ${JSON.stringify(changeRecordSetsResult)}`);

    let waitParams = {
      Id: changeRecordSetsResult.ChangeInfo.Id
    };

    this.logMessage('Waiting for Route53 change to propagate');
    await this._awsRoute53Client.waitFor('resourceRecordSetsChanged', waitParams).promise();
    this.logMessage(`Change Propagated! [DomainName: ${domainName}]`);
  }

  /**
   *
   * @param domainName
   * @param dnsName
   * @param hostedZoneId
   * @return {Promise.<TResult>}
   */
  async associateDomainWithCloudFront(domainName, cloudFrontDNSName) {
    // This is a hardcoded AWS CloudFront Value
    const CLOUDFRONT_HOSTED_ZONE_ID = 'Z2FDTNDATAQYW2';

    //get hostedZoneID from domainName
    const domainHostedZoneId = await this._getHostedZoneIdFromDomainName(domainName);

    //check if any changes
    let parameters = {
      domainName: domainName,
      dnsName: cloudFrontDNSName,
      domainNameHostedZoneId: domainHostedZoneId
    };

    this.logMessage(`Checking if resource record has changed. [Params: ${JSON.stringify(parameters)}]`);

    const hasRecordSetChangedResult = await this._hasResourceRecordSetChanged(parameters, CLOUDFRONT_HOSTED_ZONE_ID);
    if (!hasRecordSetChangedResult) {
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

    this.logMessage(`Associating Domain with CloudFront. [DomainName: ${domainName}] [Cloudfront DNS Name: ${cloudFrontDNSName}]`);
    const changeRecordSetsResult = await this._awsRoute53Client.changeResourceRecordSets(params).promise();
    this.logMessage(`Result: ${JSON.stringify(changeRecordSetsResult)}`);

    let waitParams = {
      Id: changeRecordSetsResult.ChangeInfo.Id
    };

    this.logMessage('Waiting for Route53 change to propagate');
    await  this._awsRoute53Client.waitFor('resourceRecordSetsChanged', waitParams).promise();
    this.logMessage(`Change Propogated! [DomainName: ${domainName}]`);

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
  async _hasResourceRecordSetChanged(currentParameters, expectedAliasHostedZoneId) {

    const recordSetsByName = await this._getResourceRecordSetsByName(currentParameters.domainNameHostedZoneId, currentParameters.domainName);
    let hasChanged = false;

    const parsedExpectedAliasHostedZoneId = expectedAliasHostedZoneId.replace('/hostedzone/','');
    this.logMessage(`ParsedExpectedAliasHostedZoneId: ${parsedExpectedAliasHostedZoneId}`);

    let foundARecord = false;
    let foundAAAARecord = false;

    recordSetsByName.forEach(item => {

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


    return hasChanged;
  }

  /**
   *
   * @param hostedZoneId
   * @param dnsName
   * @returns {Promise<Array>}
   * @private
   */
  async _getResourceRecordSetsByName(hostedZoneId, dnsName) {
    this.logMessage(`Starting _getResourceRecordSetsByName. [HostedZoneId: ${hostedZoneId}] [DnsName: ${dnsName}]`);
    const params = {
      HostedZoneId: hostedZoneId,
      StartRecordName: dnsName
    };

    const recordSets = await this._awsRoute53Client.listResourceRecordSets(params).promise();

    this.logMessage(`_getResourceRecordSetsByName Results: ${JSON.stringify(recordSets)}`);

    let itemName;
    let itemRegion;

    return __.filter(recordSets.ResourceRecordSets, (item) => {
      itemName = __.get(item, 'Name', '').toLocaleUpperCase();
      itemRegion = __.get(item, 'Region', '').toLocaleUpperCase();
      return itemName === `${dnsName.toLocaleUpperCase()}.` && (!itemRegion || itemRegion === this._region.toLocaleUpperCase());
    });
  }

  /**
   *
   * @param domainName
   * @return {Promise.<TResult>}
   * @private
   */
  async _getHostedZoneIdFromDomainName(domainName) {
    this.logMessage(`Starting _getHostedZoneIdFromDomainName. [DomainName: ${domainName}]`);

    let parsedHostName = this._getHostedZoneNameFromDomainName(domainName);
    let params = {};
    const foundHostedZones = await this._awsRoute53Client.listHostedZonesByName(params).promise();


    this.logMessage(`Looking up HostedZones by Name. [ParsedHostName: ${parsedHostName}] [Results: ${JSON.stringify(foundHostedZones)}]`);
    let resultHostedZoneId = '';
    if(foundHostedZones && foundHostedZones.HostedZones && foundHostedZones.HostedZones.length > 0) {
      //find hostedZones that match the
      let matchingHostedZones = __.filter(foundHostedZones.HostedZones, (hostedZone) =>  {
        return hostedZone.Name.startsWith(parsedHostName);
      });

      if(matchingHostedZones && matchingHostedZones.length > 0) {
        resultHostedZoneId = matchingHostedZones[0].Id;
      }
    }
    return resultHostedZoneId;
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
   *
   * @param domainName
   * @param healthCheckResourcePath
   * @return {Promise.<TResult>}
   * @private
   */
  async _createHealthCheck(domainName, healthCheckResourcePath) {
    this.logMessage(`Starting _createHealthCheck. [DomainName: ${domainName}] [ResourcePath: ${healthCheckResourcePath}]`);

    const params = {
      CallerReference: uuid(),
      HealthCheckConfig: {
        Type: 'HTTP',
        EnableSNI: false,
        FailureThreshold: 5,
        FullyQualifiedDomainName: domainName,
        HealthThreshold: 0,
        InsufficientDataHealthStatus: 'Unhealthy',
        Inverted: false,
        MeasureLatency: true,
        Port: 80,
        Regions: [ this._region ],
        RequestInterval: 30,
        ResourcePath: healthCheckResourcePath
      }
    };

    const healthCheckData = await this._awsRoute53Client.createHealthCheck(params).promise();
    this.logMessage(`Created HealthCheck: [Id: ${healthCheckData.HealthCheck.Id}]`);

    return healthCheckData;
  }
}

module.exports = Route53Client;
