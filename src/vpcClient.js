const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');

AWS.config.setPromisesDependency(require('bluebird'));

class VpcClient {

  constructor(region = 'us-west-2') {
    this.ec2Client = new AWS.EC2({apiVersion: '2016-09-15', region: region});
  }

  /**
   * Creates a VPC from a custom configuration JSON object
   * {
   *  name: <name of VPC>,
   *  environment: <environment tag for VPC>,
   *  cidrBlock: <this is a string of the cidrblock that represents the VPC>,
   *  subnets: [
   *    {
   *      name: <name of subnet>,
   *      cidrBlock: <this is a string of the cidrblock that represents the subnet>
   *    },
   *    ...
   *  ]
   * }
   * @param config
   */
  createVpcFromConfig(config) {

    return this.doesVpcExists(config.name).then(exists => {
      if(exists) {
        this.logMessage(`Vpc already created.  Taking no action. [VpcName: ${config.name}]`);
        return;
      }
      else {
        let vpcId = '';
        let internetGatewayId = '';
        let subnetIds = [];
        return this.createVpc(config.name, config.environment, config.cidrBlock).then(createdVpcId => {
          vpcId = createdVpcId;

          return;
        }).then(() => {

          let subnetPromises = [];
          for(let subnetIndex = 0; subnetIndex < config.subnets.length; subnetIndex++) {
            let subnetObject = config.subnets[subnetIndex];
            subnetPromises.push(this.createVpcSubnet(vpcId, subnetObject.name, config.environment, subnetObject.cidrBlock).then(subnetResult => {
              subnetIds.push(subnetResult.Subnet.SubnetId);
            }));
          }

          return BlueBirdPromise.all(subnetPromises);
        }).then(() => {
          return this.createAndAttachInternetGateway(vpcId, `${config.name} - Internet Gateway`, config.environment).then(createdInternetGatewayId => {
            internetGatewayId = createdInternetGatewayId;
          });
        }).then(() => {
          //Create Route Table and associate it with Subnets
          let routeTableId = '';

          return this.createRouteTable(vpcId, `${config.name} - Route Table`, config.environment).then(createdRouteTableId => {
            routeTableId = createdRouteTableId;
          }).then(() => {
            return this.addInternetGatewayToRouteTable(internetGatewayId, routeTableId);
          }).then(() => {
            //associate subnets with route table
            let subnetAssociationPromises = [];
            for(let subnetIndex = 0; subnetIndex < subnetIds.length; subnetIndex++) {
              subnetAssociationPromises.push(this.associateSubnetWithRouteTable(routeTableId, subnetIds[subnetIndex]));
            }

            return BlueBirdPromise.all(subnetAssociationPromises);
          });
        });
      }
    }).then(() => {
      console.log('done');
    });


  }

  /**
   * Creates a VPC with a name and environment tag; returns vpcId
   * @return Promise json object
   * data = {
       Vpc: {
         CidrBlock: "10.0.0.0/16",
         DhcpOptionsId: "dopt-7a8b9c2d",
         InstanceTenancy: "default",
         State: "pending",
         VpcId: "vpc-a01106c2"
       }
     }
   * @param name
   * @param cidrBlock The network range for the VPC, in CIDR notation. For example, 10.0.0.0/16
   */
  createVpc(name, environment, cidrBlock) {
    let params = {
      CidrBlock: cidrBlock, /* required */
      DryRun: false,
      InstanceTenancy: 'default'//'default | dedicated | host'
    };

    this.logMessage('Creating VPC');
    let createVpcPromise = this.ec2Client.createVpc(params).promise();

    let vpcId = '';
    return createVpcPromise
      .then(data => {
        vpcId = data.Vpc.VpcId;

        this.logMessage(`VPC Created [VpcId: ${vpcId}]`);
        let vpcAvailableParams = {
          VpcIds: [vpcId]
        };

        return this.ec2Client.waitFor('vpcAvailable', vpcAvailableParams).promise();
      }).then(() => {
        //assign tags
        let tags = [
          { Key: 'Name', Value: name },
          { Key: 'Environment', Value: environment },
        ];
        return this._createTags(vpcId, tags);
      }).then(() => {
        return vpcId;
      }).catch(err => {
        console.log(`error: ${JSON.stringify(err)}`);
      });
  }

  getVpcIdFromName(name) {
    let params = {
      DryRun: false,
      Filters: [
        {
          Name: 'tag:Name',
          Values: [ name ],
        }
      ]
    };

    this.logMessage(`Looking up VPC by name. [Vpc Name: ${name}]`);
    return this.ec2Client.describeVpcs(params).promise().then(result => {
      if(result.Vpcs && result.Vpcs.length > 0) {
        return result.Vpcs[0].VpcId;
      } else {
        return '';
      }
    });
  }

  /**
   * Returns true if a VPC exists for the given name
   * @param name VpcName
   */
  doesVpcExists(name) {
    return this.getVpcIdFromName(name).then(result => {
      let exists = result !== '';
      this.logMessage(`Vpc Existence Check. [VpcName: ${name}] [VpcExists: ${exists}]`);
      return exists;
    });
  }

  /**
   * Returns the SubnetId
   * @param vpcId
   * @param name
   * @param environment
   * @param cidrBlock
   */
  createVpcSubnet(vpcId, name, environment, cidrBlock) {
    this.logMessage(`Creating Vpc Subnet. [VpcId: ${vpcId}] [VpcSubnetName: ${name}] [Environment: ${environment}] [Subnet CidrBlock: ${cidrBlock}]`);
    let params = {
      CidrBlock: cidrBlock,
      VpcId: vpcId,
      DryRun: false
    };
    let createSubnetPromise = this.ec2Client.createSubnet(params).promise();

    let subnetId = '';
    return createSubnetPromise.then(result => {
      subnetId = result.Subnet.SubnetId;
      this.logMessage(`Creating Vpc Subnet Id. [SubnetId: ${subnetId}]`);
      //assign tags
      let tags = [
        { Key: 'Name', Value: name },
        { Key: 'Environment', Value: environment },
      ];
      return this._createTags(result.Subnet.SubnetId, tags);
    }).then(() => {
      return subnetId;
    });
  }

  /**
   *
   * @param vpcId
   * @param name
   * @param environment
   * @returns {Promise.<TResult>}
   */
  createAndAttachInternetGateway(vpcId, name, environment) {
    let params = {};

    this.logMessage(`Creating Internet Gateway. [VpcId: ${vpcId}]`);
    let createInternetGatewayPromise = this.ec2Client.createInternetGateway(params).promise();

    let internetGatewayId = '';
    return createInternetGatewayPromise.then(result => {
      internetGatewayId = result.InternetGateway.InternetGatewayId;

      let tags = [
        { Key: 'Name', Value: name },
        { Key: 'Environment', Value: environment },
      ];
      return this._createTags(internetGatewayId, tags);
    }).then(() => {
      this.logMessage(`Attaching InternetGateway to VPC. [VpcId: ${vpcId}] [InternetGatewayId: ${internetGatewayId}]`);

      let params = {
        InternetGatewayId: internetGatewayId,
        VpcId: vpcId
      };
      return this.ec2Client.attachInternetGateway(params).promise();
    });
  }

  createRouteTable(vpcId, name, environment) {
    let params = {
      VpcId: vpcId
    };

    let createRouteTablePromise = this.ec2Client.createRouteTable(params).promise();

    let routeTableId = '';
    return createRouteTablePromise.then(result => {
      routeTableId = result.RouteTable.RouteTableId;

      //assign tags
      let tags = [
        { Key: 'Name', Value: name },
        { Key: 'Environment', Value: environment },
      ];

      return this._createTags(routeTableId, tags);
    }).then(() => {
      return routeTableId;
    });
  }

  /**
   *
   * @param internetGatewayId
   * @param routeTableId
   * @returns {Promise<EC2.Types.CreateRouteResult>}
   */
  addInternetGatewayToRouteTable(internetGatewayId, routeTableId) {
    let params = {
      DestinationCidrBlock: "0.0.0.0/0",
      GatewayId: internetGatewayId,
      RouteTableId: routeTableId
    };
    let createRoutePromise = this.ec2Client.createRoute(params).promise();

    this.logMessage(`Creating Route on RouteTable. [RouteTableId: ${routeTableId}]`);
    return createRoutePromise;
  }

  /**
   *
   * @param routeTableId
   * @param subnetId
   * @returns {Promise<EC2.Types.AssociateRouteTableResult>}
   */
  associateSubnetWithRouteTable(routeTableId, subnetId) {
    let params = {
      RouteTableId: routeTableId, /* required */
      SubnetId: subnetId, /* required */
      DryRun: false
    };

    this.logMessage(`Associating Subnet with RouteTable. [RouteTableId: ${routeTableId}] [SubnetId: ${subnetId}]`);
    let associateRouteTablePromise = this.ec2Client.associateRouteTable(params).promise();

    return associateRouteTablePromise;
  }

  /**
   *
   * @param resourceId
   * @param tags Array of objects which contain a Key and Value key
   * @param addCreatedTag
   * @returns {Promise.<TResult>}
   * @private
   */
  _createTags(resourceId, tags, addCreatedTag = true) {

    if(addCreatedTag) {
      tags.push({ Key: 'Created', Value:  moment().format()});
    }

    //assign tags
    let createTagParams = {
      Resources: [ resourceId ],
      Tags: tags,
      DryRun: false
    };

    this.logMessage(`Assigning Tags to ResourceId. [ResourceId: ${resourceId}] [Tags: ${JSON.stringify(tags)}]`);
    return this.ec2Client.createTags(createTagParams).promise();
  }

  logMessage(msg) {
    console.log(msg);
  }
}


module.exports = VpcClient;