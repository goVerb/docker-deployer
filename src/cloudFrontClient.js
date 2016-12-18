'use strict';

const AWS = require('aws-sdk');
const __ = require('lodash');
const uuid = require('uuid');
const BPromise = require('bluebird');

AWS.config.setPromisesDependency(BPromise);

class CloudFrontClient {
  constructor(accessKey = '', secretKey = '') {

    const cloudfrontParams = {
      apiVersion: '2016-01-28',
      accessKeyId: accessKey,
      secretAccessKey: secretKey
    };

    this._cloudfrontClient = new AWS.CloudFront(cloudfrontParams);
  }

  createCloudFrontDistribution(params) {
    console.log('Creating Cloud Front Distribution');
    const {callerReference, cname, comment, originName, apiGatewayId, gatewayPathRegex} = params;
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
              DomainName: `${apiGatewayId}.execute-api.us-west-2.amazonaws.com`, /* required */
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
              OriginPath: gatewayPathRegex
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
              PathPattern: gatewayPathRegex, /* required */
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

    return this._cloudfrontClient.createDistribution(cloudFrontParams).promise();
  }

  getDistributionByCName(cname) {
    console.log('Executing getDistributionByCName.');
    const params = {};

    let distribution;
    
    return this._cloudfrontClient.listDistributions(params).promise().then(data => {
      const distributionList = data.DistributionList.Items;
      const distribution = distributionList.find(obj => {
        return obj.Aliases.Quantity > 0 && __.includes(obj.Aliases.Items, cname);
      });
      return distribution;
    }).then(dist => {
      distribution = dist;
      if(!distribution) {
        console.log(`Distribution not found! [CNAME: ${cname}]`);
      } else {
        console.log(`Distribution found! [CNAME: ${cname}]`);
      }
    }).then(() => {
      if(!distribution) {
        return;
      }
      return this._cloudfrontClient.getDistributionConfig({
        Id: distribution.Id
      }).promise();
    }).then(data => {
      data.DistributionConfig.Id = distribution.Id;
      data.DistributionConfig.ETag = distribution.ETag;
      return data.DistributionConfig;
    });
  }

  createOriginAndCacheBehavior(distribution, newOrigin, newCacheBehavior) {
    console.log('Executing createOriginAndCacheBehavior.');

    if(!distribution.Origins) {
      distribution.Origins = {
        Items: [],
        Quantity: 0
      };
    }

    if(!distribution.CacheBehaviors) {
      distribution.CacheBehaviors = {
        Items: [],
        Quantity: 0
      };
    }

    console.log('Checking if origin and cacheBehavior already exists.');

    const originExists = doesOriginAlreadyExists(distribution, newOrigin);
    const behaviorExists = doesCacheBehaviorAlreadyExists(distribution, newCacheBehavior);
    if(originExists && behaviorExists) {
      return BPromise.resolve({
        message: 'Origin and Cache Behavior already exists in cloudfront.  No Action taken.'
      });
    } else {
      console.log('Origin and CacheBehavior dont exist.');
    }

    distribution.Origins.Items.push(newOrigin);
    distribution.Origins.Quantity++;


    distribution.CacheBehaviors.Items.push(newCacheBehavior);
    distribution.CacheBehaviors.Quantity++;

    console.log('Removing unnecessary items from distribution.');
    let distributionId = distribution.Id;
    let distributionETag = distribution.ETag;
    delete distribution.Id;
    delete distribution.Status;
    delete distribution.LastModifiedTime;
    delete distribution.DomainName;
    delete distribution.ETag;

    let params = {
      'Id': distributionId,
      'DistributionConfig': distribution,
      'IfMatch': distributionETag
    };

    console.log(`Params: ${JSON.stringify(params)}`);
    return this._cloudfrontClient.updateDistribution(params).promise();
  }
}

let doesOriginAlreadyExists = function(distribution, newOrigin) {

  if(distribution.Origins.Items.length <= 0) {
    return false;
  }

  const result = distribution.Origins.Items.find(obj => {
    return obj.DomainName === newOrigin.DomainName &&
      obj.OriginPath === newOrigin.OriginPath &&
      obj.Id === newOrigin.Id;
  });

  return Boolean(result);
};

let doesCacheBehaviorAlreadyExists = function(distribution, newCacheBehavior) {

  if(distribution.CacheBehaviors.Items.length <= 0) {
    return false;
  }

  const result = distribution.CacheBehaviors.Items.find(obj => {
    return obj.PathPattern === newCacheBehavior.PathPattern &&
      obj.TargetOriginId === newCacheBehavior.TargetOriginId;
  });

  return Boolean(result);
};

module.exports = CloudFrontClient;
