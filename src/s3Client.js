const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
const base64 = require('base-64');
const util = require('util');
const awspublish = require('gulp-awspublish');

const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BlueBirdPromise);


class S3Client extends BaseClient {
  // TODO: Disable SSL?
  get _awsS3Client() {

    if(!this._internalS3Client) {
      let params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2006-03-01',
        region: this._region,
        sslEnabled: true
      };
      this._internalS3Client = new AWS.S3(params);
    }

    return this._internalS3Client;
  }


  /**
   *
   * @param s3BucketName
   * @param callback
   * @returns {Promise.<*>}
   */
  LookupS3BucketByName(s3BucketName) {
    let params = {
      Bucket: s3BucketName
    };
    this.logMessage(`Checking if Bucket exists. [S3BucketName: ${JSON.stringify(s3BucketName)}]`);
    let listBucketsPromise = this._awsS3Client.listBuckets().promise();

    return listBucketsPromise.then(results => {
      if(__.isEmpty(results.Buckets)) return {};

      return __.find(results.Buckets, { Name: s3BucketName });
    });
  }


  /**
   *
   * @param s3BucketName
   * @returns {Promise.<*>}
   */
  createBucket(s3BucketName /*, stageName, variableCollection*/ ) {
    return new BlueBirdPromise((resolve, reject) => {
      let params = {
        Bucket: s3BucketName, /* required */
        CreateBucketConfiguration: {
          LocationConstraint: this._region
        }
      };
      this.logMessage(`Creating Deployment. [s3BucketName: ${s3BucketName}]`);
      this._awsS3Client.createBucket(params, (err, data) => {
        if(err) {
          let errorMessage = `Error: ${JSON.stringify(err)} | Error Stack Trace: ${err.stack}`;
          this.logMessage(errorMessage);
          reject({
            message: errorMessage
          });
        } else {
          this.logMessage(`Success: ${JSON.stringify(data)}`);
          resolve();
        }
      });
    });
  }


  /**
   *
   * @param s3BucketName
   * @returns {Promise.<*>}
   */
  enableHosting(s3BucketName /*, stageName, variableCollection*/ ) {
    return new BlueBirdPromise((resolve, reject) => {
      let params = {
        Bucket: s3BucketName, /* required */
        WebsiteConfiguration: { /* required */
          ErrorDocument: {
            Key: 'index.html' /* required */
          },
          IndexDocument: {
            Suffix: 'index.html' /* required */
          }
        }
      };
      this.logMessage(`Enabling Hosting. [s3BucketName: ${s3BucketName}]`);
      this._awsS3Client.putBucketWebsite(params, (err, data) => {
        if(err) {
          let errorMessage = `Error: ${JSON.stringify(err)} | Error Stack Trace: ${err.stack}`;
          this.logMessage(errorMessage);
          reject({
            message: errorMessage
          });
        } else {
          this.logMessage(`Success: ${JSON.stringify(data)}`);
          resolve();
        }
      });
    });
  }

  /**
   * This will do the following: 1. lookup S3 by name, 2. delay 3a. if S3 not found create the new S3, 3b. if S3 found it will update it 4. delay again
   * @param {Object} options
   * @param {number} [delayInMilliseconds=16000] this defaults to 16 seconds
   * @return {Promise<Object>|Promise<gulpUtil.PluginError>}
   */
  createBucketIfNecessary(options, delayInMilliseconds = 5000) {
    let methodName = 'createOrOverwriteS3Bucket';
    this.logMessage(`LookupS3BucketByName: [options: ${JSON.stringify(options)}]`)
    return this.LookupS3BucketByName(options.name).delay(delayInMilliseconds).then((foundS3Bucket) => {
      if(__.isEmpty(foundS3Bucket)) {
        this.logMessage(`No bucket found. Creating one. [Bucket name: ${methodName}]`);
        return this.createBucket(options.name).delay(delayInMilliseconds).then(() => {
          return this.enableHosting(options.name).delay(delayInMilliseconds);
        });
      }
      this.logMessage(`${methodName}: Found the bucket. No changes needed. [foundS3Bucket: ${JSON.stringify(foundS3Bucket)}]`);
    }).catch((err) => {
      this.logMessage(`${methodName}: Error! [err: ${JSON.stringify(err)}]`);
      return BlueBirdPromise.reject(err);
    });
  }

  /**
   * This will do the following: 1. lookup S3 by name, 2. delay 3a. if S3 not found create the new S3, 3b. if S3 found it will update it 4. delay again
   * @param {Object} options
   * @return {Promise<Object>|Promise<gulpUtil.PluginError>}
   */
  publishToBucket(options) {
    // let methodName = 'publishToBucket';

    return awspublish.create({
      region: this._region,
      params: {
        Bucket: options.name
      },
      accessKeyId: this._accessKey,
      secretAccessKey: this._secretKey,
    });
  }


}


module.exports = S3Client;
