'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
const uuid = require('uuid');

const BaseClient = require('./baseClient');

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

    const recordSetsByName = await this._getResourceRecordSetsByName(domainHostedZoneId, domainName);

    //create if necessary
    const healthCheckId = await this._createOrGetHealthCheck(domainName, dnsName, healthCheckResourcePath);

    const params = {
      HostedZoneId: domainHostedZoneId,
      ChangeBatch: {
        Changes: []
      }
    };

    //remove this region's Records from recordSetsByName

    recordSetsByName.forEach(record => {
      let changeParams = {
        Action: 'UPSERT',
        ResourceRecordSet: {}
      };
      changeParams.ResourceRecordSet = _extends({}, record);
      delete changeParams.ResourceRecordSet.ResourceRecords;

      if (record.Region !== this._region) {
        params.ChangeBatch.Changes.push(changeParams);
      }
    });

    //Add hard coded items
    params.ChangeBatch.Changes.push({
      Action: 'UPSERT',
      ResourceRecordSet: {
        Name: domainName,
        Region: this._region,
        SetIdentifier: `${this._region} - ALB`,
        HealthCheckId: healthCheckId,
        Type: 'A',
        AliasTarget: {
          DNSName: dnsName,
          EvaluateTargetHealth: !!healthCheckId,
          HostedZoneId: hostedZoneId
        }
      }
    });
    params.ChangeBatch.Changes.push({
      Action: 'UPSERT',
      ResourceRecordSet: {
        Name: domainName,
        Region: this._region,
        SetIdentifier: `${this._region} - ALB`,
        HealthCheckId: healthCheckId,
        Type: 'AAAA',
        AliasTarget: {
          DNSName: dnsName,
          EvaluateTargetHealth: !!healthCheckId,
          HostedZoneId: hostedZoneId
        }
      }
    });

    const isNewRRSetSame = this._isRoute53ResourceRecordSame(params, recordSetsByName);

    if (isNewRRSetSame) {
      this.logMessage(`No RRSet changes need to be made.  No Action taken.`);
      return BlueBirdPromise.resolve();
    }
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
   * @param currentParameters
   * @param currentParameters.domainName
   * @param currentParameters.dnsName
   * @param currentParameters.domainNameHostedZoneId
   * @return {Promise.<bool>}
   * @private
   */
  _hasCloudFrontResourceRecordSetChanged(currentParameters, expectedAliasHostedZoneId) {

    return this._getResourceRecordSetsByName(currentParameters.domainNameHostedZoneId, currentParameters.domainName).then(results => {
      let hasChanged = false;

      const parsedExpectedAliasHostedZoneId = expectedAliasHostedZoneId.replace('/hostedzone/', '');
      this.logMessage(`ParsedExpectedAliasHostedZoneId: ${parsedExpectedAliasHostedZoneId}`);

      let foundARecord = false;
      let foundAAAARecord = false;
      results.forEach(item => {

        //break if the true condition is met
        if (hasChanged) {
          return;
        }

        if (item.Type === 'A') {

          if (item.AliasTarget.HostedZoneId !== parsedExpectedAliasHostedZoneId) {
            this.logMessage(`A Record hostedZoneId has changed. [ExistingValue: ${item.AliasTarget.HostedZoneId}] [NewValue: ${parsedExpectedAliasHostedZoneId}]`);
            hasChanged = true;
          }

          if (item.AliasTarget.EvaluateTargetHealth !== false) {
            this.logMessage(`A Record EvaluateTargetHealth has changed. [ExistingValue: ${item.AliasTarget.EvaluateTargetHealth}] [NewValue: ${false}]`);
            hasChanged = true;
          }

          let formattedCurrentParamDnsName = __.get(currentParameters, 'dnsName', '').toLocaleUpperCase();
          let formattedExistingAliasTargetDNSName = __.get(item, 'AliasTarget.DNSName', '').toLocaleUpperCase();

          if (!formattedExistingAliasTargetDNSName.startsWith(formattedCurrentParamDnsName)) {
            this.logMessage(`A Record DNSName has changed. [ExistingValue: ${formattedExistingAliasTargetDNSName}] [NewValue: ${formattedCurrentParamDnsName}]`);
            hasChanged = true;
          }

          foundARecord = true;
        } else if (item.Type === 'AAAA') {

          if (item.AliasTarget.HostedZoneId !== parsedExpectedAliasHostedZoneId) {
            this.logMessage(`AAAA Record hostedZoneId has changed. [ExistingValue: ${item.AliasTarget.HostedZoneId}] [NewValue: ${parsedExpectedAliasHostedZoneId}]`);
            hasChanged = true;
          }

          if (item.AliasTarget.EvaluateTargetHealth !== false) {
            this.logMessage(`AAAA Record EvaluateTargetHealth has changed. [ExistingValue: ${item.AliasTarget.EvaluateTargetHealth}] [NewValue: ${false}]`);
            hasChanged = true;
          }

          let formattedCurrentParamDnsName = __.get(currentParameters, 'dnsName', '').toLocaleUpperCase();
          let formattedExistingAliasTargetDNSName = __.get(item, 'AliasTarget.DNSName', '').toLocaleUpperCase();

          if (!formattedExistingAliasTargetDNSName.startsWith(formattedCurrentParamDnsName)) {
            this.logMessage(`AAAA Record DNSName has changed. [ExistingValue: ${formattedExistingAliasTargetDNSName}] [NewValue: ${formattedCurrentParamDnsName}]`);
            hasChanged = true;
          }

          foundAAAARecord = true;
        } else {
          hasChanged = true;
        }
      });

      if (!foundARecord || !foundAAAARecord) {
        hasChanged = true;
      }

      console.log(hasChanged);
      return hasChanged;
    });
  }

  /**
   *
   * @param params
   * @param recordSetsByName
   * @return {bool}
   * @private
   */
  _isRoute53ResourceRecordSame(params, recordSetsByName) {
    //diffing our newly constructed RRSet with that is in the system
    let paramsDict = {};
    let recordSetDict = {};
    params.ChangeBatch.Changes.forEach(set => {
      paramsDict[`${set.ResourceRecordSet.Type} - ${set.ResourceRecordSet.SetIdentifier} - ${set.ResourceRecordSet.Region}`] = set.ResourceRecordSet;
    });

    recordSetsByName.forEach(set => {
      recordSetDict[`${set.Type} - ${set.SetIdentifier} - ${set.Region}`] = set;
      delete recordSetDict[`${set.Type} - ${set.SetIdentifier} - ${set.Region}`].ResourceRecords;
    });

    let isNewRRSetSame = true;
    for (let key in paramsDict) {
      let formattedCurrentParamDnsName = __.get(paramsDict[key], 'AliasTarget.DNSName', '').toLocaleUpperCase();
      let formattedExistingAliasTargetDNSName = __.get(recordSetDict[key], 'AliasTarget.DNSName', '').toLocaleUpperCase();

      if (!formattedExistingAliasTargetDNSName.startsWith(formattedCurrentParamDnsName)) {
        this.logMessage(`DNSName has changed. [ExistingValue: ${formattedExistingAliasTargetDNSName}] [NewValue: ${formattedCurrentParamDnsName}] [Key: ${key}] `);
        isNewRRSetSame = false;
        break;
      }

      if (__.get(paramsDict[key], 'HealthCheckId', '') !== __.get(recordSetDict[key], 'HealthCheckId', '')) {
        this.logMessage(`HealthCheckId has changed. [ExistingValue: ${recordSetDict[key].HealthCheckId}] [NewValue: ${paramsDict[key].HealthCheckId}] [Key: ${key}]`);
        isNewRRSetSame = false;
        break;
      }

      if (paramsDict[key].AliasTarget.EvaluateTargetHealth !== recordSetDict[key].AliasTarget.EvaluateTargetHealth) {
        this.logMessage(`EvaluateTargetHealth has changed. [ExistingValue: ${recordSetDict[key].AliasTarget.EvaluateTargetHealth}] [NewValue: ${paramsDict[key].AliasTarget.EvaluateTargetHealth}] [Key: ${key}]`);
        isNewRRSetSame = false;
        break;
      }
    }

    return isNewRRSetSame;
  }

  /**
   *
   * @param domainName
   * @return {Promise<void>}
   * @param cloudFrontDNSName
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

    const hasRecordSetChangedResult = await this._hasCloudFrontResourceRecordSetChanged(parameters, CLOUDFRONT_HOSTED_ZONE_ID);
    if (!hasRecordSetChangedResult) {
      this.logMessage(`No Route53 changes need to be made.  No Action taken.`);
      return BlueBirdPromise.resolve();
    }

    let params = {
      HostedZoneId: domainHostedZoneId,
      ChangeBatch: {
        Changes: [{
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
        }, {
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
        }]
      }
    };

    this.logMessage(`Associating Domain with CloudFront. [DomainName: ${domainName}] [Cloudfront DNS Name: ${cloudFrontDNSName}]`);
    const changeRecordSetsResult = await this._awsRoute53Client.changeResourceRecordSets(params).promise();
    this.logMessage(`Result: ${JSON.stringify(changeRecordSetsResult)}`);

    let waitParams = {
      Id: changeRecordSetsResult.ChangeInfo.Id
    };

    this.logMessage('Waiting for Route53 change to propagate');
    await this._awsRoute53Client.waitFor('resourceRecordSetsChanged', waitParams).promise();
    this.logMessage(`Change Propogated! [DomainName: ${domainName}]`);
  }

  /**
   *
   * @param recordsSets
   * @returns {Promise<Bool>}
   * @private
   */
  _doResourceRecordsHaveHealthCheck(recordSets, dnsName, domainName) {
    this.logMessage(`Starting _doesResourceRecordHaveHealthCheck. [Records: ${JSON.stringify(recordSets)}] [DNSName: ${JSON.stringify(dnsName)}]`);
    const reformattedDnsName = dnsName.toLocaleLowerCase() + '.';
    let result = true;
    recordSets.forEach(record => {
      if (record.AliasTarget.DNSName === reformattedDnsName) {
        if (!record.HealthCheckId || record.AliasTarget.EvaluateTargetHealth !== true) {
          result = false;
        }
      }
    });

    return result;
  }

  /**
   *
   * @param healthCheckUrl
   * @returns {Promise<string>}
   * @private
   */
  async _doesHealthCheckAlreadyExist(healthCheckUrl) {
    this.logMessage(`Checking for existing health check [DomainName: ${healthCheckUrl}]`);

    const healthCheckName = `${healthCheckUrl} - HealthCheck`;

    const allHealthChecks = await this._awsRoute53Client.listHealthChecks().promise();

    const allHealthCheckIds = allHealthChecks.HealthChecks.map(item => {
      return item.Id;
    });

    const params = {
      ResourceIds: [...allHealthCheckIds],
      ResourceType: 'healthcheck'
    };
    const existingHealthCheckTags = await this._awsRoute53Client.listTagsForResources(params).promise();

    let healthCheckId = '';

    const length = existingHealthCheckTags.ResourceTagSets.length;
    for (let tagSetIndex = 0; tagSetIndex < length; tagSetIndex++) {
      const tagSet = existingHealthCheckTags.ResourceTagSets[tagSetIndex];

      const tagsLength = tagSet.Tags.length;
      for (let tagItemIndex = 0; tagItemIndex < tagsLength; tagItemIndex++) {
        let tag = tagSet.Tags[tagItemIndex];
        if (tag.Key === 'Name' && tag.Value === healthCheckName) {
          healthCheckId = tagSet.ResourceId;
          break;
        }
      }

      //if healthCheckId if found, stop iterating over all health checks
      if (healthCheckId) {
        break;
      }
    }

    return healthCheckId;
  }

  /**
   *
   * @param hostedZoneId
   * @param dnsName
   * @returns {Promise<Array>}
   * @private
   */
  async _getResourceRecordSetsByName(hostedZoneId, domainName) {
    this.logMessage(`Starting _getResourceRecordSetsByName. [HostedZoneId: ${hostedZoneId}] [DnsName: ${domainName}]`);
    const params = {
      HostedZoneId: hostedZoneId,
      StartRecordName: domainName
    };

    const recordSets = await this._awsRoute53Client.listResourceRecordSets(params).promise();

    this.logMessage(`_getResourceRecordSetsByName Results: ${JSON.stringify(recordSets)}`);

    let itemName;
    let itemRegion;

    return __.filter(recordSets.ResourceRecordSets, item => {
      itemName = __.get(item, 'Name', '').toLocaleUpperCase();
      return itemName === `${domainName.toLocaleUpperCase()}.`;
    });
  }

  /**
   *
   * @param domainName
   * @return {Promise<string>}
   * @private
   */
  async _getHostedZoneIdFromDomainName(domainName) {
    this.logMessage(`Starting _getHostedZoneIdFromDomainName. [DomainName: ${domainName}]`);

    let parsedHostName = this._getHostedZoneNameFromDomainName(domainName);
    let params = {};
    const foundHostedZones = await this._awsRoute53Client.listHostedZonesByName(params).promise();

    this.logMessage(`Looking up HostedZones by Name. [ParsedHostName: ${parsedHostName}] [Results: ${JSON.stringify(foundHostedZones)}]`);
    let resultHostedZoneId = '';
    if (foundHostedZones && foundHostedZones.HostedZones && foundHostedZones.HostedZones.length > 0) {
      //find hostedZones that match
      let matchingHostedZones = __.filter(foundHostedZones.HostedZones, hostedZone => {
        return hostedZone.Name.startsWith(parsedHostName);
      });

      if (matchingHostedZones && matchingHostedZones.length > 0) {
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
    if (domainNameSplit.length < 2) {
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
   * @param dnsName
   * @param healthCheckResourcePath
   * @return {Promise<string>}
   * @private
   */
  async _createOrGetHealthCheck(domainName, dnsName, healthCheckResourcePath = '') {

    //should not create or look for healthcheck if healthCheckResourcePath is empty
    if (!healthCheckResourcePath) {
      return '';
    }

    const retrievedHealthCheckId = await this._doesHealthCheckAlreadyExist(dnsName);

    let healthCheckId = '';
    if (!retrievedHealthCheckId) {
      const healthCheckData = await this._createHealthCheck(dnsName, healthCheckResourcePath);
      healthCheckId = healthCheckData.HealthCheck.Id;
    } else {
      //get healthcheck Id somehow
      healthCheckId = retrievedHealthCheckId;
    }

    return healthCheckId;
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
        FullyQualifiedDomainName: domainName,
        Inverted: false,
        MeasureLatency: true,
        Port: 80,
        ResourcePath: healthCheckResourcePath
      }
    };

    const healthCheckData = await this._awsRoute53Client.createHealthCheck(params).promise();
    this.logMessage(`Created HealthCheck: [Id: ${healthCheckData.HealthCheck.Id}]`);

    const healthCheckTagParams = {
      ResourceId: healthCheckData.HealthCheck.Id,
      ResourceType: 'healthcheck',
      AddTags: [{
        Key: 'Name',
        Value: `${domainName} - HealthCheck`
      }]
    };

    // add Name tag to HealthCheck
    const healthCheckTagData = await this._awsRoute53Client.changeTagsForResource(healthCheckTagParams).promise();

    return healthCheckData;
  }
}

module.exports = Route53Client;
