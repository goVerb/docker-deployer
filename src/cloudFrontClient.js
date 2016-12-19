'use strict';
const AWS = require('aws-sdk');
const __ = require('lodash');
const uuid = require('uuid');
const BluebirdPromise = require('bluebird');

AWS.config.setPromisesDependency(BluebirdPromise);

class CloudFrontClient {

  constructor(accessKey = '', secretKey = '') {

    this._accessKey = accessKey;
    this._secretKey = secretKey;
  }

  get _awsCloudfrontClient() {

    if(!this._internalCloudfrontClient) {
      const cloudfrontParams = {
        apiVersion: '2016-01-28',
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey
      };
      this._internalCloudfrontClient = new AWS.CloudFront(cloudfrontParams);
    }

    return this._internalCloudfrontClient;
  }

  /**
   *
   * @param params
   * @return {Promise.<D>}
   */
  createCloudFrontDistribution(params) {
    return this._getDistributionByCName(params.cname).then(distribution => {
      if(!__.isEmpty(distribution) && !__.isNil(distribution)) {
        this.logMessage(`CloudFront Distribution already exist. No action taken. [Cname: ${params.cname}]`);
        return;
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
    const {callerReference, cname, comment, originName, originDomainName, originPath} = params;
    const cloudFrontParams = {
      DistributionConfig: { /* required */
        CallerReference: callerReference, /* required */
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
            QueryString: false, /* required */
            Headers: {
              Quantity: 4, /* required */
              Items: [
                'x-***REMOVED***-version',
                'x-***REMOVED***-test',
                'Content-Type',
                'authorization'
              ]
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
          Compress: false,
          DefaultTTL: 0,
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
                OriginProtocolPolicy: 'match-viewer', /* required */
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
                }
              },
              MinTTL: 0, /* required */
              PathPattern: originPath, /* required */
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
              Compress: false,
              DefaultTTL: 0,
              MaxTTL: 0,
              SmoothStreaming: false
            }
          ]
        },
        PriceClass: 'PriceClass_All'
      }
    };

    let createDistributionPromise = this._awsCloudfrontClient.createDistribution(cloudFrontParams).promise();

    let distributionId;
    return createDistributionPromise.then(result => {

      distributionId = result.Distribution.Id;
      const waitForParams = {
        Id: distributionId
      };

      this.logMessage(`Waiting for Cloudfront Distribution to deploy. [CloudFront Id: ${distributionId}] [Cname: ${params.cname}]`);
      return this._awsCloudfrontClient.waitFor('distributionDeployed', waitForParams).promise();
    }).then(() => {
      this.logMessage(`Distribution deployed! [CloudFront Id: ${distributionId}] [Cname: ${params.cname}]`);
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

    let listDistributionsPromise = this._awsCloudfrontClient.listDistributions(params).promise();

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
        return distribution;
      } else {
        this.logMessage(`Distribution not found! [Cname: ${cname}]`);
        return {};
      }
    });
  }

  /**
   * Logs messages
   * @param msg
   */
  logMessage(msg) {
    console.log(msg);
  }
}

module.exports = CloudFrontClient;
