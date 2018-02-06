'use strict';
const AWS = require('aws-sdk');
const __ = require('lodash');
const uuid = require('uuid');

const BaseClient = require('./baseClient');


/**
 * @typedef {Object} CloudFrontDistributionObject
 * @property {DistributionConfigObject} DistributionConfig
 */

/**
 * @typedef {Object} DistributionConfigObject
 * @property {string} CallerReference
 * @property {AliasObject} Aliases
 * @property {Object} ViewerCertificate
 * @property {boolean} IsIPV6Enabled
 */

/**
 * @typedef {Object} AliasObject
 * @property {Array} Items
 * @property {number} Quantity
 */

class CloudFrontClient extends BaseClient {

  constructor(accessKey = '', secretKey = '') {
    // Calls super and sets the region to null
    super(accessKey, secretKey, null);
  }

  /**
   *
   * @return {AWS.CloudFront|CloudFront}
   * @private
   */
  get _awsCloudFrontClient() {

    if(!this._internalCloudFrontClient) {
      const cloudfrontParams = {
        apiVersion: '2017-03-25',
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey
      };
      this._internalCloudFrontClient = new AWS.CloudFront(cloudfrontParams);
    }

    return this._internalCloudFrontClient;
  }

  /**
   *
   * @param {Object} params
   * @param {string} params.cname
   * @return {Promise.<*>}
   */
  async createOrUpdateCloudFrontDistribution(params) {
    const distribution = await this._getDistributionByCName(params.cname);

    if(!__.isEmpty(distribution) && !__.isNil(distribution)) {
      if(!this._isDistributionOutOfDate(distribution, params)) {
        this.logMessage(`CloudFront Distribution already exist. No action taken. [Cname: ${params.cname}]`);
        return distribution;
      } else {
        this.logMessage(`CloudFront distribution already exist, but out of date.  Updating Cloudfront. [Cname: ${params.cname}]`);
        return await this._updateCloudFrontDistribution(distribution, params);
      }
    } else {
      return await this._createCloudFrontDistribution(params);
    }
  }

  /**
   *
   * @param {Object} params
   * @param {string} params.cname
   * @return {Promise<*>}
   * @private
   */
  async _createCloudFrontDistribution(params) {
    this.logMessage(`Creating Cloud Front Distribution. [Cname: ${params.cname}]`);
    let distribution;
    let waitForParams;

    try {
      const cloudFrontParams = this._buildDistributionConfig(params);
      const result = await this._awsCloudFrontClient.createDistribution(cloudFrontParams).promise();

      distribution = result.Distribution;

      waitForParams = {
        Id: distribution.Id
      };

      this.logMessage(`Waiting for CloudFront Distribution to deploy. [CloudFront Id: ${distribution.Id}] [Cname: ${params.cname}]`);
      await this._awsCloudFrontClient.waitFor('distributionDeployed', waitForParams).promise();

      this.logMessage(`Distribution deployed! [CloudFront Id: ${distribution.Id}] [Cname: ${params.cname}]`);
      return distribution;

    } catch (err) {
      this.logMessage(`First waitFor failed for [CloudFront Id: ${distribution.Id}] TRYING AGAIN!`);
      return await this._awsCloudFrontClient.waitFor('distributionDeployed', waitForParams).promise();
    }
  }

  /**
   *
   * @param {Object} distribution
   * @param {Object} params
   * @param {string} params.cname
   * @return {Promise<*>}
   * @private
   */
  async _updateCloudFrontDistribution(distribution, params) {
    this.logMessage(`Updating Cloud Front Distribution. [Cname: ${params.cname}]`);

    let updatedDistribution;
    let waitForParams;
    try {
      let cloudFrontParams = this._buildDistributionConfig(params, distribution.DistributionConfig.CallerReference);
      cloudFrontParams.Id = distribution.Id;
      cloudFrontParams.IfMatch = distribution.ETag;

      const result = await this._awsCloudFrontClient.updateDistribution(cloudFrontParams).promise();

      updatedDistribution = result.Distribution;

        waitForParams = {
          Id: updatedDistribution.Id
        };

      this.logMessage(`Waiting for CloudFront Distribution to deploy. [CloudFront Id: ${updatedDistribution.Id}] [Cname: ${params.cname}]`);
      await this._awsCloudFrontClient.waitFor('distributionDeployed', waitForParams).promise();

      this.logMessage(`Distribution deployed! [CloudFront Id: ${updatedDistribution.Id}] [Cname: ${params.cname}]`);
      return updatedDistribution;

    } catch (err) {
      this.logMessage(`First waitFor failed for [CloudFront Id: ${updatedDistribution.Id}] TRYING AGAIN!`);
      return await this._awsCloudFrontClient.waitFor('distributionDeployed', waitForParams).promise();
    }

  }

  /**
   *
   * @param {string} cname
   * @return {Promise<CloudFrontDistributionObject|Object>}
   * @private
   */
  async _getDistributionByCName(cname) {
    this.logMessage(`Executing getDistributionByCName. [Cname: ${cname}]`);
    let params = {};
    let distribution = {};

    const distributionData = await this._awsCloudFrontClient.listDistributions(params).promise();

    if(distributionData && distributionData.DistributionList && distributionData.DistributionList.Items && distributionData.DistributionList.Items.length > 0) {
      const distributionList = distributionData.DistributionList.Items;
      distribution = distributionList.find(obj => {
        return obj.Aliases.Quantity > 0 && __.includes(obj.Aliases.Items, cname);
      });
    }

    if(!__.isNil(distribution) && !__.isEmpty(distribution)) {
      this.logMessage(`Distribution found! [Cname: ${cname}]`);
      let getDistributionParams = {
        Id: distribution.Id
      };

      const getDistributionResult = await this._awsCloudFrontClient.getDistribution(getDistributionParams).promise();

      //we add the ETag to the distribution
      let localDistribution = getDistributionResult.Distribution;
      localDistribution.ETag = getDistributionResult.ETag;

      return localDistribution;
    } else {
      this.logMessage(`Distribution not found! [Cname: ${cname}]`);
      return {};
    }
  }

  /**
   *
   * @param {CloudFrontDistributionObject} distribution
   * @param {Object} params
   * @return {boolean}
   * @private
   */
  _isDistributionOutOfDate(distribution, params) {
    const {
      cname,
      acmCertArn,
      enableLogging,
      comment,
      originName,
      originDomainName,
      originPath,
      pathPattern,
      originProtocolPolicy,
      viewerProtocolPolicy,
      queryString,
      cloudfrontPaths = [],
      customErrorResponses = [],
    } = params;

    const defaultCloudFrontPathIndex = __.findIndex(cloudfrontPaths, (item) => { return item.isDefault;});

    let computedOriginProtocolPolicy = originProtocolPolicy || 'match-viewer';
    let computedViewerProtocolPolicy = viewerProtocolPolicy || __.get(cloudfrontPaths, `[${defaultCloudFrontPathIndex}].viewerProtocolPolicy`, '') || 'allow-all';

    //cname
    let foundAliasIndex = __.indexOf(distribution.DistributionConfig.Aliases.Items, cname);
    if(foundAliasIndex < 0) {
      this.logMessage('Found Alias Index < 0');
      return true;
    }

    //acmCertArn
    if(distribution.DistributionConfig.ViewerCertificate.ACMCertificateArn !== acmCertArn) {
      this.logMessage('ACMCERT does not match');
      return true;
    }

    //comment
    if(distribution.DistributionConfig.Comment !== comment) {
      this.logMessage('COMMENT does not match');
      return true;
    }

    //defaultCacheBehavior

    //QueryString
    let foundDefaultCacheBehavior = distribution.DistributionConfig.DefaultCacheBehavior;
    if((cloudfrontPaths.length <= 0 && foundDefaultCacheBehavior.ForwardedValues.QueryString !== queryString) ||
      (cloudfrontPaths.length > 0 && foundDefaultCacheBehavior.ForwardedValues.QueryString !== __.get(cloudfrontPaths, `[${defaultCloudFrontPathIndex}].queryString`, false))) {
      this.logMessage('DefaultCacheBehavior: QueryString does not match.');
      return true;
    }

    //viewerProtocolPolicy
    if((cloudfrontPaths.length <= 0 && foundDefaultCacheBehavior.ViewerProtocolPolicy !== computedViewerProtocolPolicy) ||
      (cloudfrontPaths.length > 0 && foundDefaultCacheBehavior.ViewerProtocolPolicy !== __.get(cloudfrontPaths, `[${defaultCloudFrontPathIndex}].viewerProtocolPolicy`, 'allow-all'))) {
      this.logMessage(`DefaultCacheBehavior: New ViewerProtocolPolicy does not match in existing. [Existing: ${foundDefaultCacheBehavior.ViewerProtocolPolicy}] [New: ${computedViewerProtocolPolicy}]`);

      return true;
    }

    //CacheBehaviors
    if(!__.isEmpty(cloudfrontPaths)) {
      let foundDifference = false;
      cloudfrontPaths.forEach(item => {
        let foundCacheBehavior = __.find(distribution.DistributionConfig.CacheBehaviors.Items, {TargetOriginId: item.originName});
        if (!foundCacheBehavior || foundCacheBehavior.PathPattern !== item.pathPattern) {
          this.logMessage('CacheBehaviors: No foundCacheBehavior or pathPattern does not match');
          foundDifference = true;
        }

        if(!foundCacheBehavior || foundCacheBehavior.ViewerProtocolPolicy !== __.get(item,'viewerProtocolPolicy','allow-all')) {
          this.logMessage(`CacheBehaviors:  [Existing ViewerProtocolPolicy: ${__.get(foundCacheBehavior,'ViewerProtocolPolicy')}] [New ViewerProtocolPolicy: ${__.get(item,'viewerProtocolPolicy')}]`);
          foundDifference = true;
        }
      });

      if(foundDifference) {
        return true;
      }
    } else {
      let foundCacheBehavior = __.find(distribution.DistributionConfig.CacheBehaviors.Items, {TargetOriginId: originName});
      let existingPathPattern = __.get(foundCacheBehavior, 'PathPattern', '');
      if (!foundCacheBehavior || existingPathPattern !== pathPattern) {
        this.logMessage(`CacheBehaviors: No foundCacheBehavior or pathPattern does not match with in else statement. [Existing: ${existingPathPattern}] [New: ${pathPattern}]`);
        return true;
      }
    }


    //originName
    if(!__.isEmpty(cloudfrontPaths)) {
      let foundDifference = false;
      cloudfrontPaths.forEach(item => {
        //originDomainName
        let foundOrigin = __.find(distribution.DistributionConfig.Origins.Items, {Id: item.originName});
        if (!foundOrigin || foundOrigin.DomainName !== item.originDomainName) {
          this.logMessage('No foundOrigin or DomainName does not match');
          foundDifference = true;
        }

        //originPath
        if (!foundOrigin || foundOrigin.OriginPath !== item.originPath) {
          this.logMessage('No foundOrigin or OriginPath does not match');
          this.logMessage(JSON.stringify(foundOrigin));
          this.logMessage(JSON.stringify(item));

          foundDifference = true;
        }

        //originProtocolPolicy
        if (!foundOrigin || foundOrigin.CustomOriginConfig.OriginProtocolPolicy !== item.originProtocolPolicy) {
          this.logMessage('No foundOrigin or OriginProtocolPolicy does not match');

          foundDifference = true;
        }
      });

      if(foundDifference) {
        return true;
      }
    }
    else {
      //originDomainName
      let foundOrigin = __.find(distribution.DistributionConfig.Origins.Items, {Id: originName});
      if (!foundOrigin || foundOrigin.DomainName !== originDomainName) {
        this.logMessage('No foundOrigin or DomainName does not match in else statement');

        return true;
      }

      //originPath
      if (!foundOrigin || foundOrigin.OriginPath !== originPath) {
        this.logMessage('No foundOrigin or OriginPath does not match in else statement');
        return true;
      }

      //originProtocolPolicy
      if (!foundOrigin || foundOrigin.CustomOriginConfig.OriginProtocolPolicy !== computedOriginProtocolPolicy) {
        this.logMessage('No foundOrigin or OriginProtocolPolicy does not match in else statement');

        return true;
      }
    }


    // Logging
    if(Boolean(enableLogging) !== distribution.DistributionConfig.Logging.Enabled) {
      this.logMessage('LoggingEnabled does not match');

      return true;
    }

    //Custom Error Responses
    if(this._isDifferenceInCustomErrorResponses(customErrorResponses, distribution)) {
      return true;
    }



    return false;
  }

  _isDifferenceInCustomErrorResponses(customErrorResponses, distribution) {
    if(__.get(customErrorResponses, 'length', 0) !== __.get(distribution, 'DistributionConfig.CustomErrorResponses.Quantity', 0)) {
      this.logMessage('CustomErrorResponses do not match');

      return true;
    } else {
      //we have to convert our custom objects to match the Cloudfront's return params in order to make the isEqual easier
      const convertedErrorCodeObjects = __.map(customErrorResponses, (item) => {
        const {errorCode, errorCachingMinTTL = 300, responseCode = '200', responsePagePath = ''} = item;

        let resultObject = {
          ErrorCode: errorCode, /* required */
          ErrorCachingMinTTL: errorCachingMinTTL,
        };

        if(!(__.isEmpty(responseCode) || __.isEmpty(responsePagePath))) {
          resultObject.ResponseCode = responseCode;
          resultObject.ResponsePagePath = responsePagePath;
        } else {
          resultObject.ResponseCode = '';
          resultObject.ResponsePagePath = '';
        }

        return resultObject;
      });

      const paramErrorCodeLookup = __.keyBy(convertedErrorCodeObjects, 'ErrorCode');
      const existingErrorCodeLookup = __.keyBy(__.get(distribution, 'DistributionConfig.CustomErrorResponses.Items', []), 'ErrorCode');
      if(!__.isEqual(paramErrorCodeLookup, existingErrorCodeLookup)) {
        this.logMessage(`CustomErrorResponses do not match. [Existing: ${existingErrorCodeLookup}] [New: ${paramErrorCodeLookup}]`);
        return true;
      }
    }

    return false;
  }

  /**
   *
   * @param {Object} params
   * @param {string} [params.originProtocolPolicy='match-viewer']
   * @param {string} [params.viewerProtocolPolicy='allow-all']
   * @param {string} [callerReference='']
   * @returns {{DistributionConfig: {CallerReference: string|*, Comment: *, DefaultCacheBehavior: null, Enabled: boolean, Origins: {Quantity: number, Items: Array}, Aliases: {Quantity: number, Items: *[]}, CacheBehaviors: {Quantity: number, Items: Array}, CustomErrorResponses: {Quantity: number, Items: Array}, DefaultRootObject: string, HttpVersion: string, IsIPV6Enabled: boolean, Logging: {Bucket: string, Enabled: boolean, IncludeCookies: boolean, Prefix: string}, PriceClass: string, Restrictions: {GeoRestriction: {Quantity: number, RestrictionType: string, Items: Array}}, WebACLId: string}}}
   * @private
   */
  _buildDistributionConfig(params, callerReference = '') {
    const {
      cname,
      enableLogging,
      acmCertArn,
      comment,
      originName = '',
      originDomainName = '',
      originPath = '',
      pathPattern = '',
      originProtocolPolicy = 'match-viewer',
      viewerProtocolPolicy = 'allow-all',
      queryString,
      cloudfrontPaths = [],
      customErrorResponses = []
    } = params;


    const cloudFrontParams = {
      DistributionConfig: { /* required */
        CallerReference: callerReference || uuid(), /* required */
        Comment: comment, /* required */
        DefaultCacheBehavior: null,
        Enabled: true, /* required */
        Origins: { /* required */
          Quantity: 0, /* required */
          Items: []
        },
        Aliases: {
          Quantity: 1, /* required */
          Items: [
            cname
          ]
        },
        CacheBehaviors: {
          Quantity: 0, /* required */
          Items: []
        },
        CustomErrorResponses: {
          Quantity: 0, /* required */
          Items: []
        },
        DefaultRootObject: '',
        HttpVersion: 'http2',
        IsIPV6Enabled: true,
        Logging: {
          Bucket: '', /* required */
          Enabled: false, /* required */
          IncludeCookies: false, /* required */
          Prefix: '' /* required */
        },
        PriceClass: 'PriceClass_All',
        Restrictions: {
          GeoRestriction: { /* required */
            Quantity: 0, /* required */
            RestrictionType: 'none', /* required */
            Items: []
          }
        },
        WebACLId: ''
      }
    };

    this.logMessage('Creating DefaultCacheBehavior, Origins, and CacheBehaviors.');
    if(!__.isEmpty(cloudfrontPaths)) {
      cloudfrontPaths.forEach((each) => {
        if(each.isDefault) {
          cloudFrontParams.DistributionConfig.DefaultCacheBehavior = this._createCacheBehavior(each, true);
        }
      });

      let origins = [];
      let cacheBehaviors = [];
      cloudfrontPaths.forEach(item => {
        origins.push(this._createOrigin(item));
        cacheBehaviors.push(this._createCacheBehavior(item, false));
      });

      cloudFrontParams.DistributionConfig.Origins.Quantity = origins.length;
      cloudFrontParams.DistributionConfig.Origins.Items = origins;

      cloudFrontParams.DistributionConfig.CacheBehaviors.Quantity = cacheBehaviors.length;
      cloudFrontParams.DistributionConfig.CacheBehaviors.Items = cacheBehaviors;

    } else {

      const cloudfrontPathParams = {
        originName,
        originDomainName,
        originPath,
        pathPattern,
        originProtocolPolicy,
        viewerProtocolPolicy,
        queryString
      };
      cloudFrontParams.DistributionConfig.DefaultCacheBehavior = this._createCacheBehavior(cloudfrontPathParams, true);

      cloudFrontParams.DistributionConfig.Origins.Quantity = 1;
      cloudFrontParams.DistributionConfig.Origins.Items = [this._createOrigin(cloudfrontPathParams)];

      this.logMessage(`Origins: ${JSON.stringify(cloudFrontParams.DistributionConfig.Origins)}`);

      cloudFrontParams.DistributionConfig.CacheBehaviors.Quantity = 1;
      cloudFrontParams.DistributionConfig.CacheBehaviors.Items = [this._createCacheBehavior(cloudfrontPathParams, false)];
    }

    this.logMessage('Attaching Custom Error Responses to Cloudfront.');
    if(!__.isEmpty(customErrorResponses)) {
      let constructedCustomErrorResponses = [];
      customErrorResponses.forEach(item => {
        constructedCustomErrorResponses.push(this._createCustomErrorResponse(item));
      });

      cloudFrontParams.DistributionConfig.CustomErrorResponses.Quantity = constructedCustomErrorResponses.length;
      cloudFrontParams.DistributionConfig.CustomErrorResponses.Items = constructedCustomErrorResponses;

      this.logMessage(`CustomErrorResponses: ${JSON.stringify(cloudFrontParams.DistributionConfig.CustomErrorResponses)}`);
    }

    this.logMessage('Attaching Cert to Cloudfront.');
    if(acmCertArn) {
      cloudFrontParams.DistributionConfig.ViewerCertificate = {
        ACMCertificateArn: acmCertArn,
        CertificateSource: 'acm',
        MinimumProtocolVersion: 'TLSv1',
        SSLSupportMethod: 'sni-only'
      };
    }
    if(enableLogging) {
      this.logMessage('Attaching logging parameters to Cloudfront.');
      cloudFrontParams.DistributionConfig.Logging = {
        Bucket: 'cloudfront-verb.s3.amazonaws.com', /* required */
        Enabled: true, /* required */
        IncludeCookies: false, /* required */
        Prefix: cname /* required */
      };
    }

    return cloudFrontParams;
  }

  /**
   *
   * @param {string} params.originName
   * @param {string} [params.originDomainName]
   * @param {string} [params.originPath]
   * @param {string} [params.originProtocolPolicy]
   * @param {string} [params.viewerProtocolPolicy='allow-all']
   * @param {string} params.pathPattern
   * @param {boolean} [params.queryString=true]
   * @param {number} [minTTL=0]
   * @param {number} [maxTTL=0]
   * @param {number} [defaultTTL=0]
   * @param {boolean} isDefaultCacheBehavior
   * @private
   */
  _createCacheBehavior(params, isDefaultCacheBehavior = false) {
    const {
      originName,
      originDomainName,
      originPath,
      originProtocolPolicy,
      viewerProtocolPolicy = 'allow-all',
      pathPattern,
      queryString = true,
      minTTL = 0,
      maxTTL = 0,
      defaultTTL = 0,


    } = params;

    const cacheBehavior =  { /* required */
      ForwardedValues: { /* required */
        Cookies: { /* required */
          Forward: 'none', /* required */
          WhitelistedNames: {
            Quantity: 0, /* required */
            Items: []
          }
        },
        QueryString: queryString, /* required */
        Headers: {
          Quantity: 6, /* required */
          Items: [
            'x-verb-version',
            'x-verb-session',
            'x-verb-correlation',
            'x-verb-test',
            'Content-Type',
            'authorization'
          ]
        },
        QueryStringCacheKeys: {
          Quantity: 0, /* required */
          Items: []
        }
      },
      MinTTL: minTTL, /* required */
      PathPattern: pathPattern, /* required */
      TargetOriginId: originName, /* required */
      TrustedSigners: { /* required */
        Enabled: false, /* required */
        Quantity: 0, /* required */
        Items: []
      },
      ViewerProtocolPolicy: viewerProtocolPolicy,/* required || Allowed options: 'allow-all | https-only | redirect-to-https' */
      AllowedMethods: {
        Items: [ /* required */
          'POST',
          'HEAD',
          'PATCH',
          'DELETE',
          'PUT',
          'GET',
          'OPTIONS'
        ],
        Quantity: 7, /* required */
        CachedMethods: {
          Items: [ /* required */
            'HEAD',
            'GET',
            'OPTIONS'
          ],
          Quantity: 3 /* required */
        }
      },
      Compress: true,
      DefaultTTL: defaultTTL,
      LambdaFunctionAssociations: {
        Quantity: 0, /* required */
        Items: []
      },
      MaxTTL: maxTTL,
      SmoothStreaming: false
    };

    if(isDefaultCacheBehavior) {
      delete cacheBehavior.PathPattern;
    }

    return cacheBehavior;
  }

  /**
   *
   * @param {string} params.originName
   * @param {string} params.originDomainName
   * @param {string} params.originPath
   * @param {string} params.originProtocolPolicy
   * @param {string} [params.pathPattern]
   * @private
   */
  _createOrigin(params) {
    const {originName, originDomainName, originPath, originProtocolPolicy, pathPattern} = params;

    return {
      DomainName: originDomainName, /* required */
      Id: originName, /* required */
      CustomHeaders: {
        Quantity: 0, /* required */
        Items: []
      },
      CustomOriginConfig: {
        HTTPPort: 80, /* required */
        HTTPSPort: 443, /* required */
        OriginProtocolPolicy: originProtocolPolicy, /* required */
        OriginKeepaliveTimeout: 60,
        OriginReadTimeout: 30,
        OriginSslProtocols: {
          Items: [ /* required */
            'TLSv1',
            'TLSv1.1',
            'TLSv1.2'
          ],
          Quantity: 3 /* required */
        }
      },
      OriginPath: originPath
    };
  }

  /**
   *
   * @param {number} params.errorCode
   * @param {number} [params.errorCachingMinTTL=300]
   * @param {string} [params.responseCode='200']
   * @param {string} params.responsePagePath
   * @return {Object}
   * @private
   */
  _createCustomErrorResponse(params) {
    const {errorCode, errorCachingMinTTL = 300, responseCode = '200', responsePagePath = ''} = params;

    let resultObject = {
      ErrorCode: errorCode, /* required */
      ErrorCachingMinTTL: errorCachingMinTTL,
    };

    //responseCode and responsePagePath have to be valid in order for the values to be populated

    if(!(__.isEmpty(responseCode) || __.isEmpty(responsePagePath))) {
      resultObject.ResponseCode = responseCode;
      resultObject.ResponsePagePath = responsePagePath;
    } else {
      if((__.isEmpty(responseCode) && !__.isEmpty(responsePagePath)) || (!__.isEmpty(responseCode) && __.isEmpty(responsePagePath))) {
        this.logMessage(`Setting ResponseCode and ResponsePagePath to empty string since one of the values was invalid.  
        Both values must be populated for the fields to be passed to Cloudfront. [ResponseCode: ${responseCode}] [ResponsePagePath: ${responsePagePath}]`);
      }
      resultObject.ResponseCode = '';
      resultObject.ResponsePagePath = '';
    }

    return resultObject;
  }
}

module.exports = CloudFrontClient;
