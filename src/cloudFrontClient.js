'use strict';
const AWS = require('aws-sdk');
const __ = require('lodash');
const uuid = require('uuid');
const BluebirdPromise = require('bluebird');

const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BluebirdPromise);

class CloudFrontClient extends BaseClient {

  constructor(accessKey = '', secretKey = '') {
    // Calls super and sets the region to null
    super(accessKey, secretKey, null);
  }

  get _awsCloudFrontClient() {

    if(!this._internalCloudFrontClient) {
      const cloudfrontParams = {
        apiVersion: '2016-01-28',
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey
      };
      this._internalCloudFrontClient = new AWS.CloudFront(cloudfrontParams);
    }

    return this._internalCloudFrontClient;
  }

  /**
   *
   * @param params
   * @return {Promise.<D>}
   */
  createOrUpdateCloudFrontDistribution(params) {
    return this._getDistributionByCName(params.cname).then(distribution => {
      if(!__.isEmpty(distribution) && !__.isNil(distribution)) {
        if(!this._isDistributionOutOfDate(distribution, params)) {
          this.logMessage(`CloudFront Distribution already exist. No action taken. [Cname: ${params.cname}]`);
          return distribution;
        } else {
          this.logMessage(`CloudFront distribution already exist, but out of date.  Updating Cloudfront. [Cname: ${params.cname}]`);
          return this._updateCloudFrontDistribution(distribution, params);
        }
      } else {
        return this._createCloudFrontDistribution(params);
      }
    });
  }

  /**
   *
   * @param params
   * @return {Promise<D>}
   * @private
   */
  _createCloudFrontDistribution(params) {
    this.logMessage(`Creating Cloud Front Distribution. [Cname: ${params.cname}]`);

    const cloudFrontParams = this._buildDistributionConfig(params);


    let distribution;
    let createDistributionPromise = this._awsCloudFrontClient.createDistribution(cloudFrontParams).promise();
    return createDistributionPromise.then(result => {

      distribution = result.Distribution;

      const waitForParams = {
        Id: distribution.Id
      };

      this.logMessage(`Waiting for CloudFront Distribution to deploy. [CloudFront Id: ${distribution.Id}] [Cname: ${params.cname}]`);
      return this._awsCloudFrontClient.waitFor('distributionDeployed', waitForParams).promise().catch(err => {
        this.logMessage(`First waitFor failed for [CloudFront Id: ${distribution.Id}] TRYING AGAIN!`);
        return this._awsCloudFrontClient.waitFor('distributionDeployed', waitForParams).promise();
      });
    }).then(() => {
      this.logMessage(`Distribution deployed! [CloudFront Id: ${distribution.Id}] [Cname: ${params.cname}]`);
      return distribution;
    });
  }

  /**
   *
   * @param distribution
   * @param params
   * @return {Promise.<TResult>}
   * @private
   */
  _updateCloudFrontDistribution(distribution, params) {
    this.logMessage(`Updating Cloud Front Distribution. [Cname: ${params.cname}]`);

    let cloudFrontParams = this._buildDistributionConfig(params, distribution.DistributionConfig.CallerReference);
    cloudFrontParams.Id = distribution.Id;
    cloudFrontParams.IfMatch = distribution.ETag;

    let updatedDistribution;
    let updateDistributionPromise = this._awsCloudFrontClient.updateDistribution(cloudFrontParams).promise();
    return updateDistributionPromise.then(result => {

      updatedDistribution = result.Distribution;

      const waitForParams = {
        Id: updatedDistribution.Id
      };

      this.logMessage(`Waiting for CloudFront Distribution to deploy. [CloudFront Id: ${updatedDistribution.Id}] [Cname: ${params.cname}]`);
      return this._awsCloudFrontClient.waitFor('distributionDeployed', waitForParams).promise().catch(err => {
        this.logMessage(`First waitFor failed for [CloudFront Id: ${updatedDistribution.Id}] TRYING AGAIN!`);
        return this._awsCloudFrontClient.waitFor('distributionDeployed', waitForParams).promise();
      });
    }).then(() => {
      this.logMessage(`Distribution deployed! [CloudFront Id: ${updatedDistribution.Id}] [Cname: ${params.cname}]`);
      return updatedDistribution;
    });
  }

  /**
   *
   * @param cname
   * @return {Promise.<CloudFrontDistribution>}
   * @private
   */
  _getDistributionByCName(cname) {
    this.logMessage(`Executing getDistributionByCName. [Cname: ${cname}]`);
    const params = {};

    let listDistributionsPromise = this._awsCloudFrontClient.listDistributions(params).promise();

    return listDistributionsPromise.then(data => {
      let distribution = {};
      if(data && data.DistributionList && data.DistributionList.Items && data.DistributionList.Items.length > 0) {
        const distributionList = data.DistributionList.Items;
        distribution = distributionList.find(obj => {
          return obj.Aliases.Quantity > 0 && __.includes(obj.Aliases.Items, cname);
        });
      }

      if(!__.isNil(distribution) && !__.isEmpty(distribution)) {
        this.logMessage(`Distribution found! [Cname: ${cname}]`);
        let getDistributionParams = {
          Id: distribution.Id
        };

        let getDistributionPromise = this._awsCloudFrontClient.getDistribution(getDistributionParams).promise();

        return getDistributionPromise.then(getDistributionResult => {

          //we add the ETag to the distribution
          let localDistribution = getDistributionResult.Distribution;
          localDistribution.ETag = getDistributionResult.ETag;
          return localDistribution;
        });
      } else {
        this.logMessage(`Distribution not found! [Cname: ${cname}]`);
        return {};
      }
    });
  }

  /**
   *
   * @param distribution
   * @param params
   * @return {boolean}
   * @private
   */
  _isDistributionOutOfDate(distribution, params) {

    const {cname, acmCertArn, enableLogging, comment, originName, originDomainName, originPath, pathPattern, originProtocolPolicy, queryString} = params;

    let computedOriginProtocolPolicy = originProtocolPolicy || 'match-viewer';

    //cname
    let foundAliasIndex = __.indexOf(distribution.DistributionConfig.Aliases.Items, cname);
    if(foundAliasIndex < 0) {
      return true;
    }

    //acmCertArn
    if(distribution.DistributionConfig.ViewerCertificate.ACMCertificateArn !== acmCertArn) {
      return true;
    }

    //comment
    if(distribution.DistributionConfig.Comment !== comment) {
      return true;
    }

    //QueryString
    if(distribution.DistributionConfig.DefaultCacheBehavior.ForwardedValues.QueryString !== queryString) {
      return true;
    }


    //originName

    //originDomainName
    let foundOrigin = __.find(distribution.DistributionConfig.Origins.Items, {Id: originName});
    if(!foundOrigin || foundOrigin.DomainName !== originDomainName) {
      return true;
    }


    //originPath
    if(!foundOrigin || foundOrigin.OriginPath !== originPath) {
      return true;
    }

    //originProtocolPolicy
    if(!foundOrigin || foundOrigin.CustomOriginConfig.OriginProtocolPolicy !== computedOriginProtocolPolicy) {
      return true;
    }

    // Logging
    if(enableLogging !== distribution.DistributionConfig.Logging.enabled) {
      return true;
    }

    return false;
  }

  _buildDistributionConfig(params, callerReference = '') {
    const {cname, enableLogging, acmCertArn, comment, originName, originDomainName, originPath, pathPattern, originProtocolPolicy, queryString} = params;

    let computedOriginProtocolPolicy = originProtocolPolicy || 'match-viewer';

    const cloudFrontParams = {
      DistributionConfig: { /* required */
        CallerReference: callerReference || uuid(), /* required */
        Comment: comment, /* required */
        DefaultCacheBehavior: { /* required */
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
              Quantity: 4, /* required */
              Items: [
                'x-***REMOVED***-version',
                'x-***REMOVED***-test',
                'Content-Type',
                'authorization'
              ]
            },
            QueryStringCacheKeys: {
              Quantity: 0, /* required */
              Items: []
            }
          },
          MinTTL: 0, /* required */
          TargetOriginId: originName, /* required */
          TrustedSigners: { /* required */
            Enabled: false, /* required */
            Quantity: 0, /* required */
            Items: []
          },
          ViewerProtocolPolicy: 'allow-all', /* required */
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
          DefaultTTL: 0,
          LambdaFunctionAssociations: {
            Quantity: 0, /* required */
            Items: []
          },
          MaxTTL: 0,
          SmoothStreaming: false
        },
        Enabled: true, /* required */
        Origins: { /* required */
          Quantity: 1, /* required */
          Items: [
            {
              DomainName: originDomainName, /* required */
              Id: originName, /* required */
              CustomHeaders: {
                Quantity: 0, /* required */
                Items: []
              },
              CustomOriginConfig: {
                HTTPPort: 80, /* required */
                HTTPSPort: 443, /* required */
                OriginProtocolPolicy: computedOriginProtocolPolicy, /* required */
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
            }
          ]
        },
        Aliases: {
          Quantity: 1, /* required */
          Items: [
            cname
          ]
        },
        CacheBehaviors: {
          Quantity: 1, /* required */
          Items: [
            {
              ForwardedValues: { /* required */
                Cookies: { /* required */
                  Forward: 'none', /* required */
                  WhitelistedNames: {
                    Quantity: 0, /* required */
                    Items: []
                  }
                },
                QueryString: false, /* required */
                Headers: {
                  Quantity: 0, /* required */
                  Items: []
                },
                QueryStringCacheKeys: {
                  Quantity: 0, /* required */
                  Items: []
                }
              },
              MinTTL: 0, /* required */
              PathPattern: pathPattern, /* required */
              TargetOriginId: originName, /* required */
              TrustedSigners: { /* required */
                Enabled: false, /* required */
                Quantity: 0, /* required */
                Items: []
              },
              ViewerProtocolPolicy: 'allow-all', /* required */
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
              DefaultTTL: 0,
              LambdaFunctionAssociations: {
                Quantity: 0, /* required */
                Items: []
              },
              MaxTTL: 0,
              SmoothStreaming: false
            }
          ]
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

    if(acmCertArn) {
      cloudFrontParams.DistributionConfig.ViewerCertificate = {
        ACMCertificateArn: acmCertArn,
        CertificateSource: 'acm',
        MinimumProtocolVersion: 'TLSv1',
        SSLSupportMethod: 'sni-only'
      };
    }
    if(enableLogging) {
      cloudFrontParams.DistributionConfig.Logging = {
        Bucket: 'cloudfront-***REMOVED***', /* required */
        Enabled: true, /* required */
        IncludeCookies: false, /* required */
        Prefix: cname /* required */
      };
    }

    return cloudFrontParams;
  }
}

module.exports = CloudFrontClient;
