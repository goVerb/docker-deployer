const AWS = require('aws-sdk');
const BlueBirdPromise = require('bluebird');
const BaseClient = require('./baseClient');
const fs = require('fs');
const extend = require('util')._extend; //eslint-disable-line no-underscore-dangle
const async = require('async');
const bbRetry = require('bluebird-retry');
const __ = require('lodash');
const promiseRetry = require('promise-retry');
const path = require('path');

AWS.config.setPromisesDependency(BlueBirdPromise);

class LambdaClient extends BaseClient {

  get deployedLambdas() {
    if(!this._deployedLambdas) {
      this._deployedLambdas = [];
    }
    return this._deployedLambdas;
  }
  get _awsLambdaClient() {
    if(!this._internalLambdaClient) {
      const params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2015-03-31',
        region: this._region
      };
      this._internalLambdaClient = new AWS.Lambda(params);
    }

    return this._internalLambdaClient;
  }

  /**
   *
   * @param {Object} deploymentParams
   * @param {String} deploymentParams.environmentName
   * @param {Object} deploymentParams.variables
   * @param {Object} lambdaConfig
   * @param {String} lambdaConfig.zipFileName
   * @param {Object} [lambdaConfig.schedule]
   * @param {Object} [lambdaConfig.logging]
   * @return {Promise.<T>}
   */
  deployLambdaFunction(deploymentParams, lambdaConfig) {
    const localConfig = this._cloneConfigObject(lambdaConfig, deploymentParams);
    const codePackage = `${lambdaConfig.zipFileName}`;
    let functionArn = '';

    const snsClient = new AWS.SNS({
      accessKeyId: this._accessKey,
      secretAccessKey: this._secretKey,
      region: this._region
    });

    const cloudWatchLogsClient = new AWS.CloudWatchLogs({
      accessKeyId: this._accessKey,
      secretAccessKey: this._secretKey,
      region: this._region
    });
    let params = {};
    const iamParams = this.buildRoleConfig(localConfig);


    params = {
      FunctionName: localConfig.functionName,
      Description: localConfig.description,
      Handler: localConfig.handler,
      Role: '',
      Timeout: localConfig.timeout || 100,
      MemorySize: localConfig.memorySize || 128,
      Runtime: localConfig.runtime || LAMBDA_RUNTIME,
      Environment: localConfig.Environment
    };


    return this.retryAwsCall(this.getLambdaFunction, 'getLambdaFunction', params.FunctionName)
      .then((getResult) => {
        if (!getResult.lambdaExists) {
          return this.createOrUpdateIAMRole(iamParams)
            .then(createResponse => {
              params.Role = createResponse.Arn;
            })
            .then(() => this.createLambdaFunction(codePackage, params))
            .then((createFunctionResult) => {
              functionArn = createFunctionResult.functionArn;
              this.deployedLambdas.push(createFunctionResult);
            })
            .then(() => this.updateEventSource(localConfig))
            .then(() => this.updatePushSource(snsClient, localConfig, functionArn))
            .then(() => {
              const localAttachLoggingFunction = () => {
                return this.attachLogging(cloudWatchLogsClient, localConfig);
              };
              return bbRetry(localAttachLoggingFunction, {max_tries: 3, interval: 1000, backoff: 500});
            })
            .then(() => {
              return this._setupScheduleForLambda(localConfig.schedule, localConfig.functionName, functionArn, deploymentParams.environmentName);
            })
            .catch((err) => {
              this.logError(`Error in createLambdaFunction(): ${JSON.stringify(err)}`);
              throw err;
            });
        }
        const existingFunctionArn = getResult.functionArn;
        return this.createOrUpdateIAMRole(iamParams)
          .then(updateResponse => {
            params.Role = updateResponse.Arn;
          })
          .then(() => this.updateLambdaFunction(codePackage, params))
          .then(() => this.retryAwsCall(this._updateLambdaConfig, '_updateLambdaConfig', params))
          .then(() => this.retryAwsCall(this.updateEventSource, 'updateEventSource', localConfig))
          .then(() => this.updatePushSource(snsClient, localConfig, existingFunctionArn))
          .then(() => this.retryAwsCall(this.publishLambdaVersion, 'publishLambdaVersion', localConfig))
          .then(() => {
            const localAttachLoggingFunction = () => {
              return this.attachLogging(cloudWatchLogsClient, localConfig);
            };
            return bbRetry(localAttachLoggingFunction, {max_tries: 3, interval: 1000, backoff: 500});
          })
          .then(() => {
            return this._setupScheduleForLambda(localConfig.schedule, localConfig.functionName, existingFunctionArn, deploymentParams.environmentName);
          })
          .catch((err) => {
            this.logError(`Error in updateLambdaFunction: ${JSON.stringify(err)}`);
            throw err;
          });
      })
      .catch((err) => {
        this.logError(`Error in getLambdaFunction: ${JSON.stringify(err)}`);
        throw err;
      });
  }

  /**
   *
   * @param {Object} scheduleParams
   * @param {String} scheduleParams.ruleName
   * @param {String} scheduleParams.ruleDescription
   * @param {String} scheduleParams.ruleScheduleExpression
   * @param {String} lambdaFunctionName
   * @param {String} lambdaArn
   * @param {String} environmentName
   * @return {Promise}
   * @private
   */
  _setupScheduleForLambda = (scheduleParams, lambdaFunctionName, lambdaArn, environmentName) => {
    if(!__.has(scheduleParams, 'ruleName') || !__.has(scheduleParams, 'ruleDescription') || !__.has(scheduleParams, 'ruleScheduleExpression')) {
      return BlueBirdPromise.resolve();
    }

    const cloudwatchevents = new AWS.CloudWatchEvents({region: this._region});

    let ruleArn;

    return cloudwatchevents.putRule({
      Name: scheduleParams.ruleName,
      Description: scheduleParams.ruleDescription,
      ScheduleExpression: scheduleParams.ruleScheduleExpression
    }).promise()
      .then((data) => {
        this.logMessage(`putRule: data: ${JSON.stringify(data)}`);
        ruleArn = data.RuleArn;
      })
      .catch((err) => {
        this.logError(`putRule: err: ${err}, ${err.stack}, ${JSON.stringify(err, ['message'])}`);
      })
      .then(() => {
        return this._awsLambdaClient.removePermission({
          FunctionName: lambdaFunctionName,
          StatementId: `${scheduleParams.ruleName}-${environmentName}-CronId`
        }).promise();
      })
      .then((data) => {
        this.logMessage(`removePermission: data: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        this.logError(`removePermission: err: ${err}, ${err.stack}, ${JSON.stringify(err, ['message'])}`);
      })
      .then(() => {
        return this._awsLambdaClient.addPermission({
          FunctionName: lambdaFunctionName,
          StatementId: `${scheduleParams.ruleName}-${environmentName}-CronId`,
          Action: 'lambda:InvokeFunction',
          Principal: 'events.amazonaws.com',
          SourceArn: ruleArn
        }).promise();
      })
      .then((data) => {
        this.logMessage(`addPermission: data: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        this.logError(`addPermission: err: ${err}, ${err.stack}, ${JSON.stringify(err, ['message'])}`);
      })
      .then(() => {
        return cloudwatchevents.putTargets({
          Rule: scheduleParams.ruleName,
          Targets: [
            {
              Id: `${lambdaFunctionName}-1`,
              Arn: lambdaArn
            }
          ]
        }).promise();
      })
      .then((data) => {
        this.logMessage(`putTargets: data: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        this.logError(`putTargets: err: ${err}, ${err.stack}, ${JSON.stringify(err, ['message'])}`);
        throw err;
      });
  };

  /**
   *
   * @param {String} functionName
   */
  getLambdaFunction = (functionName) => {
    return new BlueBirdPromise((resolve, reject) => {
      const getFunctionParams = {
        FunctionName: functionName
      };

      this._awsLambdaClient.getFunction(getFunctionParams, (err, data) => {
        if (err && err.statusCode !== 404) {
          this.logMessage(`AWS API request failed. Check your AWS credentials and permissions. [Error: ${JSON.stringify(err)}]`);
          reject(err);
        }
        else if (err && err.statusCode === 404) {
          this.logMessage(`Lambda not found. [LambdaName: ${functionName}]`);
          resolve({lambdaExists: false});
        }
        else {
          this.logMessage(`Lambda found! [LambdaName: ${functionName}]`);
          this.deployedLambdas.push(data);
          resolve({
            lambdaExists: true,
            functionArn: data.Configuration.FunctionArn
          });
        }
      });
    });
  };

  /**
   *
   * @param {Object} params
   * @param {String} params.Role This is the role name
   * @param {Array} params.Policies
   * @return {Promise}
   */
  createOrUpdateIAMRole (params) {
    if (params.hasOwnProperty('Role') && !params.hasOwnProperty('Policies')) {
      return BlueBirdPromise.resolve({Arn: params.Role});
    }

    const roleName = params.Role;
    const policies = params.Policies;
    let roleToReturn;
    return this.getIAMRole(roleName)
      .catch(err => {
        if (err.code === 'NoSuchEntity') {
          this.logMessage(`IAM Role not found. [Role Name: ${roleName}]`);
          return this.createIAMRole(roleName)
            .then(createResponse => this.waitForIamRolePropagation(createResponse));
        } else {
          this.logMessage(`err: ${JSON.stringify(err, null, 2)}`);
          throw err;
        }
      })
      .then(roleResponse => {


        roleToReturn = roleResponse;
        return BlueBirdPromise.mapSeries(policies, policy => {
          const localParams = {
            PolicyDocument: policy.PolicyDocument,
            PolicyName: policy.PolicyName,
            RoleName: roleToReturn.RoleName
          };
          return this.putIAMRolePolicy(localParams);
        });
      })
      .then(() => {
        return roleToReturn;
      });
  }

  /**
   * Looks up Role from RoleName
   * @param {String} roleName
   * @return {Promise}
   */
  getIAMRole(roleName) {
    const iamClient = new AWS.IAM();
    this.logMessage(`Getting IAM Role. [Role Name: ${roleName}]`);
    const localParams = {
      RoleName: roleName
    };
    return iamClient.getRole(localParams).promise()
      .then(data => {
        return data.Role;
      });
  }

  /**
   * Creates Role with default permissions.
   * @param {String} roleName
   * @return {Promise.<TResult>}
   */
  createIAMRole(roleName) {
    this.logMessage(`Creating IAM Role. [Role Name: ${roleName}]`);
    const iamClient = new AWS.IAM();
    const assumedRolePolicyDocument = `{
    "Version": "2012-10-17",
      "Statement": [
        {
        "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
                },
        "Action": "sts:AssumeRole"
            }
        ]
    }`;
    const localParams = {
      AssumeRolePolicyDocument: assumedRolePolicyDocument,
      RoleName: roleName
    };
    return iamClient.createRole(localParams).promise()
      .then(data => {
        this.logMessage(`createRoleResult: [${JSON.stringify(data, null, 2)}]`);
        return data.Role;
      })
      .catch(err => {
        this.logError(`Error creating role: ${JSON.stringify(err, null, 2)}`);
        throw err;
      });
  }

  /**
   * Returns given value after a set wait time
   * @param {*} returnValue
   * @return {*}
   */
  waitForIamRolePropagation(returnValue) {
    return BlueBirdPromise.delay(8000).then(() => {
        return returnValue;
      });
  }

  /**
   *
   * @param {Object} params
   * @param {String} params.RoleName
   * @param {String} params.PolicyName
   * @param {Object} params.PolicyDocument
   * @return {Promise}
   */
  putIAMRolePolicy(params) {
    this.logMessage(`Creating IAM Role. [Role Name: ${params.RoleName}]`);
    const iamClient = new AWS.IAM();
    const localParams = {
      PolicyDocument: JSON.stringify(params.PolicyDocument),
      PolicyName: params.PolicyName,
      RoleName: params.RoleName
    };

    return iamClient.putRolePolicy(localParams).promise()
      .then(data => {
        return data;
      });
  }

  /**
   *
   * @param {Object} config
   * @param config.serviceName
   * @param config.functionName
   * @param {Object} deploymentParams
   * @param {String} deploymentParams.environmentName
   * @param {Object} deploymentParams.variables
   * @private
   * @returns {Object}
   */
  _cloneConfigObject (config, deploymentParams) {
    const resultConfig = JSON.parse(JSON.stringify(config));

    const deployEnvironment = deploymentParams.environmentName.toLocaleLowerCase();
    resultConfig.functionName = `${config.functionName}-${deployEnvironment}`;
    resultConfig.Environment = {};
    resultConfig.Environment.Variables = deploymentParams.variables || {};

    return resultConfig;
  }

  /**
   *
   * @param {Object} config
   * @param {String} config.role
   * @param {String} config.functionName name of the lambda function
   * @param {Array} config.policies
   * @return {*}
   */
  buildRoleConfig(config) {
    let params;
    if (config.role && config.policies) {
      params = {
        Role: config.role,
        Policies: config.policies
      };
    }
    else if (!config.hasOwnProperty('role') && config.policies) {
      params = {
        Role: `${config.functionName}-role`, // use the lambda name + role as the role
        Policies: config.policies
      };
    }
    else if (!config.hasOwnProperty('role') && !config.hasOwnProperty('policies')) {
      params = {
        Role: `${config.functionName}-role`, // use the lambda name + role as the role
        Policies: [
          {
            PolicyName: 'LambdaBasicLogging',
            PolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: [
                    'logs:CreateLogGroup',
                    'logs:CreateLogStream',
                    'logs:PutLogEvents'
                  ],
                  Resource: 'arn:aws:logs:*:*:*'
                }
              ]
            }
          }
        ]
      };
    }
    else {
      params = {
        Role: config.role || 'arn:aws:iam::000000000000:role/lambda_basic_execution'
      };
    }
    return params;
  }

  /**
   *
   * @param codePackage
   * @param {Object} params
   * @param {String} params.FunctionName
   * @returns {bluebird|exports|module.exports}
   * @private
   */
  createLambdaFunction(codePackage, params) {
    return new BlueBirdPromise((resolve, reject) => {
      this.logMessage(`Creating LambdaFunction. [FunctionName: ${params.FunctionName}]`);
      const zipFileContents = fs.readFileSync(codePackage);
      const localParams = params;
      localParams.Code = {ZipFile: zipFileContents};
      this._awsLambdaClient.createFunction(localParams, (err, data) => {
        if (err) {
          this.logError(`Create function failed. Check your iam:PassRole permissions. [Error: ${JSON.stringify(err)}]`);
          reject(err);
        }
        else {
          this.logMessage(`Created Lambda successfully. [Data: ${JSON.stringify(data)}]`);
          resolve({functionArn: data.FunctionArn});
        }
      });
    });
  }

  /**
   *
   * @param {Object} config
   * @param {String} config.functionName
   * @returns {bluebird|exports|module.exports}
   * @private
   */
  updateEventSource(config) {
    return new BlueBirdPromise((resolve, reject) => {
      if (!config.eventSource) {
        resolve();
        return;
      }

      const localParams = extend({
        FunctionName: config.functionName
      }, config.eventSource);

      const getEventSourceMappingsParams = {
        FunctionName: localParams.FunctionName,
        EventSourceArn: localParams.EventSourceArn
      };

      this._awsLambdaClient.listEventSourceMappings(getEventSourceMappingsParams, (err, data) => {
        if (err) {
          this.logError(`List event source mapping failed, please make sure you have permission. [Error: ${JSON.stringify(err)}`);
          reject(err);
        }
        else if (data.EventSourceMappings.length === 0) {
          this._awsLambdaClient.createEventSourceMapping(localParams, (mappingError) => {
            if (mappingError) {
              this.logError(`Failed to create event source mapping! Error: ${mappingError}`);
              reject(mappingError);
            }
            else {
              resolve();
            }
          });
        }
        else {
          async.eachSeries(data.EventSourceMappings, (mapping, iteratorCallback) => {
            const updateEventSourceMappingParams = {
              UUID: mapping.UUID,
              BatchSize: localParams.BatchSize
            };
            this._awsLambdaClient.updateEventSourceMapping(updateEventSourceMappingParams, iteratorCallback);
          }, (updateMappingError) => {
            if (updateMappingError) {
              this.logError(`Update event source mapping failed. ${updateMappingError}`);
              reject(updateMappingError);
            }
            else {
              resolve();
            }
          });
        }
      });
    });
  }


  /**
   *
   * @param {String} codePackageLocation
   * @param {Object} params
   * @param {String} params.FunctionName
   * @returns {bluebird|exports|module.exports}
   * @private
   */
  updateLambdaFunction = (codePackageLocation, params) => {
    return new BlueBirdPromise((resolve, reject) => {
      this.logMessage(`Updating LambdaFunction. [FunctionName: ${params.FunctionName}]`);
      const zipFileContents = fs.readFileSync(path.resolve(codePackageLocation));
      const updateFunctionParams = {
        FunctionName: params.FunctionName,
        ZipFile: zipFileContents,
        Publish: false
      };

      this._awsLambdaClient.updateFunctionCode(updateFunctionParams, (err, data) => {
        if (err) {
          this.logError(`UpdateFunction Error: ${JSON.stringify(err)}`);
          reject(err);
        }
        else {
          this.logMessage(`Successfully updated lambda function code [FunctionName: ${params.FunctionName}] [Data: ${JSON.stringify(data, null, 2)}]`);
          resolve();
        }
      });
    });
  };

  /**
   *
   * @param {Object} params
   * @param {String} params.FunctionName
   * @param {Object} params.Environment.Variables
   * @return {Promise}
   * @private
   */
  _updateLambdaConfig = (params) => {
    this.logMessage('Starting _updateLambdaConfig.');
    const updateFunctionConfigurationPromise = this._awsLambdaClient.updateFunctionConfiguration(params).promise();

    return updateFunctionConfigurationPromise.then(data => {
      this.logMessage(`Successfully updated lambda config [FunctionName: ${params.FunctionName}] [Data: ${JSON.stringify(data, null, 2)}]`);
    }).catch(err => {
      this.logError(`UpdateFunctionConfiguration Error: ${JSON.stringify(err)}`);
      throw err;
    });
  };

  /**
   *
   * @param snsClient
   * @param {Object} config
   * @param config.pushSource
   * @param functionArn
   * @returns {bluebird|exports|module.exports}
   * @private
   */
  updatePushSource = (snsClient, config, functionArn) => {
    if (!config.pushSource) {
      return BlueBirdPromise.resolve(true);
    }

    return BlueBirdPromise.each(config.pushSource, (currentTopic, currentIndex, length) => {
      this.logMessage(`Executing Topic ${currentIndex} of ${length} || Current Topic: ${JSON.stringify(currentTopic)}`);
      const currentTopicNameArn = currentTopic.TopicArn;
      const currentTopicStatementId = currentTopic.StatementId;
      const topicName = currentTopic.TopicArn.split(':').pop();

      return this.createTopicIfNotExists(snsClient, topicName)
        .then(() => this.subscribeLambdaToTopic(snsClient, config, functionArn, topicName, currentTopicNameArn, currentTopicStatementId))
        .catch((err) => {
          this.logError(`Error creating topic: ${JSON.stringify(err)}`);
          throw err;
        });
    });
  };

  /**
   *
   * @param snsClient
   * @param {String} topicName
   * @returns {bluebird|exports|module.exports}
   * @private
   */
  createTopicIfNotExists = (snsClient, topicName) => {
    return new BlueBirdPromise((resolve, reject) => {
      const listTopicParams = {};

      snsClient.listTopics(listTopicParams, (err, data) => {
        if (err) {
          this.logError(`Failed to list to topic. Error: ${JSON.stringify(err)}`);
          reject(err);
        }
        else {
          const foundTopic = __.find(data.Topics, (o) => o.TopicArn === topicName);
          if (!__.isUndefined(foundTopic)) {
            resolve();
          }
          else {
            const createParams = {
              Name: topicName
            };

            snsClient.createTopic(createParams, (createTopicError) => {
              if (createTopicError) {
                this.logError(`Failed to create to topic. Error ${JSON.stringify(createTopicError)}`);
                reject(createTopicError);
              }
              else {
                resolve();
              }
            });
          }
        }
      });
    });
  }

  /**
   *
   * @param snsClient
   * @param config
   * @param functionArn
   * @param topicName
   * @param currentTopicNameArn
   * @param {String} currentTopicStatementId
   * @returns {bluebird|exports|module.exports}
   * @private
   */
  subscribeLambdaToTopic = (snsClient, config, functionArn, topicName, currentTopicNameArn, currentTopicStatementId) => {
    return new BlueBirdPromise((resolve, reject) => {
      const subParams = {
        Protocol: 'lambda',
        Endpoint: functionArn,
        TopicArn: currentTopicNameArn
      };

      snsClient.subscribe(subParams, (err) => {
        if (err) {
          this.logError(`Failed to subscribe to topic. [Topic Name: ${topicName}] [TopicArn: ${subParams.TopicArn}] [Error: ${JSON.stringify(err)}]`);
          reject(err);
        }
        else {
          const removePermissionParams = {
            FunctionName: config.functionName,
            StatementId: currentTopicStatementId
          };
          this._awsLambdaClient.removePermission(removePermissionParams, (removePermissionError, data) => {
            if (removePermissionError && removePermissionError.StatusCode === 404) {
              this.logError(`Permission does not exist. [Error: ${JSON.stringify(removePermissionError)}]`);
            }
            else if (removePermissionError && removePermissionError.statusCode !== 404) {
              this.logError(`Unable to delete permission. [Error: ${JSON.stringify(removePermissionError)}]`);
            }
            else {
              this.logMessage(`Permission deleted successfully! [Data: ${JSON.stringify(data)}]`);
            }

            const permissionParams = {
              FunctionName: config.functionName,
              Action: 'lambda:InvokeFunction',
              Principal: 'sns.amazonaws.com',
              StatementId: currentTopicStatementId,
              SourceArn: currentTopicNameArn
            };
            this._awsLambdaClient.addPermission(permissionParams, (addPermissionError, addPermissionResult) => {
              if (addPermissionError) {
                this.logError(`Failed to add permission. [Error: ${JSON.stringify(addPermissionError)}]`);
                reject(addPermissionError);
              }
              else {
                this.logMessage(`Succeeded in adding permission. [Data: ${JSON.stringify(addPermissionResult)}]`);
                resolve();
              }
            });
          });
        }
      });
    });
  };

  /**
   *
   * @param {Object} config
   * @param {String} config.functionName
   * @return {Promise}
   */
  publishLambdaVersion = (config) => {
    return this.retryAwsCall(this._publishVersion, '_publishVersion', config)
      .then(() => this.retryAwsCall(this._listVersionsByFunction, '_listVersionsByFunction', config))
      .then((listVersionsResult) => {
        const versionsToDeletePromises = [];
        const last = listVersionsResult.Versions[listVersionsResult.Versions.length - 1].Version;
        for (let index = 0; index < listVersionsResult.Versions.length; ++index) {
          const version = listVersionsResult.Versions[index].Version;
          if (version !== '$LATEST' && version !== last) {
            versionsToDeletePromises.push(this._deleteLambdaFunctionVersion(config, version));
          }
        }
        return Promise.all(versionsToDeletePromises);
      });
  };

  /**
   *
   * @param {Object} config
   * @param {String} config.functionName
   * @return {Promise}
   * @private
   */
  _publishVersion = (config) => {
    this.logMessage('Starting _publishVersion');

    const publishVersionParams = {FunctionName: config.functionName};

    const publishVersionPromise = this._awsLambdaClient.publishVersion(publishVersionParams).promise();

    return publishVersionPromise.then(result => {
      this.logMessage(`Successfully published version. [Data: ${JSON.stringify(result)}]`);
      return result;
    }).catch(err => {
      this.logError(`Error Publishing Version. [Error: ${JSON.stringify(err)}]`);
      throw err;
    });
  };

  /**
   *
   * @param {Object} config
   * @param {String} config.functionName
   * @return {Promise}
   * @private
   */
  _listVersionsByFunction = (config) => {
    this.logMessage('Starting _listVersionsByFunction.');

    const listVersionsParams = {FunctionName: config.functionName};

    const listVersionsByFunctionPromise = this._awsLambdaClient.listVersionsByFunction(listVersionsParams).promise();

    return listVersionsByFunctionPromise.catch(listErr => {
      this.logError(`Error Listing Versions for Lambda Function. [Error: ${JSON.stringify(listErr)}]`);
      return {Versions: []};
    });
  };

  /**
   *
   * @param {Object} config
   * @param {String} config.functionName
   * @param version
   */
  _deleteLambdaFunctionVersion = (config, version) => {
    this.logMessage(`Starting _deleteLambdaFunctionVersion. [Version: ${version}]`);
    const deleteFunctionParams = {
      FunctionName: config.functionName,
      Qualifier: version
    };


    const deleteFunctionPromise = this._awsLambdaClient.deleteFunction(deleteFunctionParams).promise();

    return deleteFunctionPromise.then(() => {
      this.logMessage(`Successfully deleted lambda version. [FunctionName: ${config.functionName}] [Version: ${version}]`);
    }).catch(err => {
      this.logError(`Failed to delete lambda version. [FunctionName: ${config.functionName}] [Version: ${version}] [Error: ${JSON.stringify(err)}]`);
    });
  };

  retryAwsCall(functionToInvoke, functionName, params) {
    const promiseRetryOptions = {
      retries: 8 // 256s (4m 16s)
    };

    return promiseRetry(promiseRetryOptions, (retry, number) => {
      this.logMessage(`${functionName} attempt #${number}`);
      return functionToInvoke(params)
        .catch(err => {
          if (err.code === 'TooManyRequestsException') {
            retry(err);
          }
          throw err;
        });
    });
  }

  /**
   *
   * @param cloudWatchLogsClient
   * @param {Object} config
   * @param {String} config.functionName
   * @param {String} config.logging.LambdaFunctionName
   * @param {String} config.logging.Principal
   * @param {String} config.logging.Arn
   * @return {Promise.<T>}
   */
  attachLogging = (cloudWatchLogsClient, config) => {
    if (!config.logging) {
      return BlueBirdPromise.resolve('no logging to attach');
    }


    return this.retryAwsCall(this._addLoggingLambdaPermissionToLambda, '_addLoggingLambdaPermissionToLambda', config)
      .then(() => this.updateCloudWatchLogsSubscription(cloudWatchLogsClient, config))
      .catch(err => {
        const parsedStatusCode = __.get(err, 'statusCode', '');
        this.logError(`Error occurred in _attachLogging. [StatusCode: ${parsedStatusCode}]`);
        if (parsedStatusCode !== 429 && err.statusCode !== '429') {

          this.logError(`Received a non-retry throttle error`);
          throw new bbRetry.StopError(`Received non-retry throttle error.  [Error: ${JSON.stringify(err)}]`);
        }
      });
  };

  /**
   *
   * @param {Object} config
   * @param {String} config.logging.LambdaFunctionName
   * @param {String} config.logging.Principal
   */
  _addLoggingLambdaPermissionToLambda = (config) => {
    this.logMessage(`Starting _addLoggingLambdaPermissionToLambda.`);
    const permissionParams = {
      Action: 'lambda:InvokeFunction',
      FunctionName: config.logging.LambdaFunctionName,
      Principal: config.logging.Principal,
      StatementId: `${config.logging.LambdaFunctionName}LoggingId`
    };

    const addPermissionPromise = this._awsLambdaClient.addPermission(permissionParams).promise();

    return addPermissionPromise.then(data => {
      this.logMessage(`_addLoggingLambdaPermissionToLambda success. [Data: ${JSON.stringify(data, null, 2)}`);
    }).catch(err => {
      if (err.message.match(/The statement id \(.*?\) provided already exists. Please provide a new statement id, or remove the existing statement./i)) {
        this.logMessage(`Lambda function already contains loggingIndex [Function: ${permissionParams.FunctionName}] [Permission StatementId: ${permissionParams.StatementId}]`);
        return;
      }
      else {
        this.logError(`Error Adding Logging Permission to Lambda. [Error: ${JSON.stringify(err)}]`, err.stack);
        throw err;
      }
    });
  };

  /**
   *
   * @param cloudWatchLogsClient
   * @param {Object} config
   * @param {String} config.logging.Arn
   * @param {String} config.functionName
   * @return {Promise}
   */
  updateCloudWatchLogsSubscription(cloudWatchLogsClient, config) {
    this.logMessage(`Starting updateCloudWatchLogsSubscription.`);
    return new BlueBirdPromise((resolve, reject) => {
      const cloudWatchParams = {
        destinationArn: config.logging.Arn, /* required */
        filterName: `LambdaStream_${config.functionName}`,
        filterPattern: '',
        logGroupName: `/aws/lambda/${config.functionName}`
      };

      this.logMessage(`Function Name: ${config.functionName} || Filter Name: ${cloudWatchParams.filterName} || Log Group Name: ${cloudWatchParams.logGroupName}`);
      cloudWatchLogsClient.putSubscriptionFilter(cloudWatchParams, (err, data) => {
        if (err) {
          if (err.message.match(/The specified log group does not exist./i)) {
            //this error shouldn't stop the deploy since its due to the lambda having never been executed in order to create the log group in Cloud Watch Logs,
            // so we are going to ignore this error
            // ..we should recover from this by creating the log group or it will be resolved on next execution after the lambda has been run once
            this.logError(`Failed to add subscription filter to lambda due it log group not existing.  [LogGroupName: ${cloudWatchParams.logGroupName}] [FilterName: ${cloudWatchParams.filterName}]`);
            resolve();
          }
          else {
            this.logError(`Failed To Add Mapping For Logger. [Error: ${JSON.stringify(err)}]`);
            reject(err);
          }
        }
        else {
          this.logMessage(`Successfully added subscription Filter. [LogGroupName: ${cloudWatchParams.logGroupName}][FilterName: ${cloudWatchParams.filterName}] [Response: ${JSON.stringify(data)}]`);
          resolve();
        }
      });
    });
  }

}

module.exports = LambdaClient;
