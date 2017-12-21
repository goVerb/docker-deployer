const AWS = require('aws-sdk');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');
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
   * @returns {Promise<T>}
   */
  async LookupS3BucketByName(s3BucketName) {

    this.logMessage(`Checking if Bucket exists. [S3BucketName: ${JSON.stringify(s3BucketName)}]`);
    const results = await this._awsS3Client.listBuckets().promise();

    if(__.isEmpty(results.Buckets)) {
      return {};
    }

    return __.find(results.Buckets, { Name: s3BucketName });
  }


  /**
   *
   * @param {string} s3BucketName
   * @returns {Promise<T>}
   */
  async createBucket(s3BucketName /*, stageName, variableCollection*/ ) {
    // return new BlueBirdPromise((resolve, reject) => {
    //   let params = {
    //     Bucket: s3BucketName, /* required */
    //     CreateBucketConfiguration: {
    //       LocationConstraint: this._region
    //     }
    //   };
    //   this.logMessage(`Creating Deployment. [s3BucketName: ${s3BucketName}]`);
    //   this._awsS3Client.createBucket(params, (err, data) => {
    //     if(err) {
    //       let errorMessage = `Error: ${JSON.stringify(err)} | Error Stack Trace: ${err.stack}`;
    //       this.logMessage(errorMessage);
    //       reject({
    //         message: errorMessage
    //       });
    //     } else {
    //       this.logMessage(`Success: ${JSON.stringify(data)}`);
    //       resolve();
    //     }
    //   });
    // });

    try {
    const params = {
      Bucket: s3BucketName, /* required */
      CreateBucketConfiguration: {
        LocationConstraint: this._region
      }
    };
    this.logMessage(`Creating Deployment. [s3BucketName: ${s3BucketName}]`);

    const data = await this._awsS3Client.createBucket(params).promise();
    this.logMessage(`Success: ${JSON.stringify(data)}`);
    return data;

    } catch (err) {

      let errorMessage = `Error: ${JSON.stringify(err)} | Error Stack Trace: ${err.stack}`;
      this.logError(errorMessage);
      return {
        message: errorMessage
      };
    }
  }


  /**
   *
   * @param {string} s3BucketName
   * @returns {Promise<T>}
   */
  async enableHosting(s3BucketName /*, stageName, variableCollection*/ ) {
    // return new BlueBirdPromise((resolve, reject) => {
    //   let params = {
    //     Bucket: s3BucketName, /* required */
    //     WebsiteConfiguration: { /* required */
    //       ErrorDocument: {
    //         Key: 'index.html' /* required */
    //       },
    //       IndexDocument: {
    //         Suffix: 'index.html' /* required */
    //       }
    //     }
    //   };
    //   this.logMessage(`Enabling Hosting. [s3BucketName: ${s3BucketName}]`);
    //   this._awsS3Client.putBucketWebsite(params, (err, data) => {
    //     if(err) {
    //       let errorMessage = `Error: ${JSON.stringify(err)} | Error Stack Trace: ${err.stack}`;
    //       this.logMessage(errorMessage);
    //       reject({
    //         message: errorMessage
    //       });
    //     } else {
    //       this.logMessage(`Success: ${JSON.stringify(data)}`);
    //       resolve();
    //     }
    //   });
    // });

    try {
      const params = {
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

      const data = await this._awsS3Client.putBucketWebsite(params).promise();
      this.logMessage(`Success: ${JSON.stringify(data)}`);
      return data;

    } catch (err) {
      let errorMessage = `Error: ${JSON.stringify(err)} | Error Stack Trace: ${err.stack}`;
      this.logMessage(errorMessage);
      return {
        message: errorMessage
      };
    }



  }

  /**
   * This will do the following: 1. lookup S3 by name, 2. delay 3a. if S3 not found create the new S3, 3b. if S3 found it will update it 4. delay again
   * @param {Object} options
   * @param {string} options.name
   * @param {boolean} options.enableHosting
   * @param {number} [delayInMilliseconds=16000] this defaults to 16 seconds
   * @return {Promise<T>}
   */
  async createBucketIfNecessary(options, delayInMilliseconds = 5000) {
    const methodName = 'createOrOverwriteS3Bucket';

    try {

      this.logMessage(`LookupS3BucketByName: [options: ${JSON.stringify(options)}]`);
      const foundS3Bucket = await this.LookupS3BucketByName(options.name);
      await BlueBirdPromise.delay(delayInMilliseconds);
      if(__.isEmpty(foundS3Bucket)) {
        this.logMessage(`No bucket found. Creating one. [Bucket name: ${methodName}]`);
        await this.createBucket(options.name);
        await BlueBirdPromise.delay(delayInMilliseconds);
          if(options.enableHosting) {
            const enableHostingResult = await this.enableHosting(options.name);
            await BlueBirdPromise.delay(delayInMilliseconds);
            return enableHostingResult;
          }
      }
      this.logMessage(`${methodName}: Found the bucket. No changes needed. [foundS3Bucket: ${JSON.stringify(foundS3Bucket)}]`);

    } catch (err) {
      this.logError(`${methodName}: Error! [err: ${JSON.stringify(err)}]`);
      throw err;
    }
  }

  /**
   * This will do the following: 1. lookup S3 by name, 2. delay 3a. if S3 not found create the new S3, 3b. if S3 found it will update it 4. delay again
   * @param {Object} options
   * @param {string} options.name
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
