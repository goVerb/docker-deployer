const AWS = require('aws-sdk');
const moment = require('moment');
const BlueBirdPromise = require('bluebird');
const __ = require('lodash');

const BaseClient = require('./baseClient');

AWS.config.setPromisesDependency(BlueBirdPromise);

class VpcClient extends BaseClient {

  get _awsEc2Client() {

    if(!this._internalEc2Client) {
      let params = {
        accessKeyId: this._accessKey,
        secretAccessKey: this._secretKey,
        apiVersion: '2016-09-15',
        region: this._region
      };
      this._internalEc2Client = new AWS.EC2(params);
    }

    return this._internalEc2Client;
  }

  /**
   * Creates a VPC from a custom configuration JSON object
   * {
   *  name: <name of VPC>,
   *  cidrBlock: <this is a string of the cidrblock that represents the VPC>,
   *  subnets: [
   *    {
   *      name: <name of subnet>,
   *      availabilityZone: <string>,
   *      mapPublicIpOnLaunch: true | false
   *      cidrBlock: <this is a string of the cidrblock that represents the subnet>
   *    },
   *    ...
   *  ],
   *  networkAcls: [
   *    {
   *      name: <name of the network ACL>,
   *      rules: [
   *        {
   *        cidrBlock: '',
   *        egress: true | false,
   *        protocol: TCP | UDP | -1 (all protocols) ,
   *        ruleAction: 'allow' | 'deny',
   *        ruleNumber: a number 0 < x < big number?
   *        }
   *      ]
   *  ]
   * }
   * @param config
   */
  async createVpcFromConfig(environment, config) {
    this.logMessage(`Executing createVpcFromConfig. [Environment: ${environment}] [Config: ${JSON.stringify(config)}]`);

    let vpcId = '';
    let routeTableId = '';
    const existingVpcId = await this.getVpcIdFromName(config.name);

    if (existingVpcId) {
      this.logMessage(`Vpc already created.  Taking no action. [VpcName: ${config.name}] [ExistingVpcId: ${existingVpcId}]`);
      vpcId = existingVpcId;
      routeTableId = await this.getRouteTableByVpcId(vpcId);
    } else {
      let internetGatewayId = '';
      let subnetIds = [];
      let networkAclNameToIdLookup = {};
      let subnetNameToIdLookup = {};

      vpcId = await this.createVpc(config.name, environment, config.cidrBlock);

      let createNetworkAclPromises = [];

      //generates a function that takes the networkAclName
      let assignNetworkAclToLookup = (networkAclName) => {
        return (createdNetworkAclId) => {
          networkAclNameToIdLookup[networkAclName] = createdNetworkAclId;
        };
      };

      this.logMessage('Creating NetworkACLs');
      for(let networkAclIndex = 0; networkAclIndex < config.networkAcls.length; networkAclIndex++) {
        let networkAclObject = config.networkAcls[networkAclIndex];
        createNetworkAclPromises.push(this.createNetworkAclWithRules(vpcId, networkAclObject.name, environment, networkAclObject.rules).then(assignNetworkAclToLookup(networkAclObject.name)));
      }

      await BlueBirdPromise.all(createNetworkAclPromises);

      this.logMessage(`Creating VPC Subnets. [VpcId: ${vpcId}]`);
      let assignSubnetIdToArray = (subnetName) => {
        return (createdSubnetId) => {
          subnetIds.push(createdSubnetId);
          subnetNameToIdLookup[subnetName] = createdSubnetId;
        };
      };

      let subnetPromises = [];
      for(let subnetIndex = 0; subnetIndex < config.subnets.length; subnetIndex++) {
        let subnetObject = config.subnets[subnetIndex];
        subnetPromises.push(this.createVpcSubnet(vpcId, subnetObject.name, environment, subnetObject.cidrBlock, subnetObject.availabilityZone, subnetObject.mapPublicIpOnLaunch).then(assignSubnetIdToArray(subnetObject.name)));
      }

      await BlueBirdPromise.all(subnetPromises);

      this.logMessage(`Associating VPC Subnets with Network Acl. [VpcId: ${vpcId}]`);
      let subnetToNetworkAclPromises = [];
      for(let subnetIndex = 0; subnetIndex < config.subnets.length; subnetIndex++) {
        let subnetObject = config.subnets[subnetIndex];
        let subnetId = subnetNameToIdLookup[subnetObject.name];
        let networkAclId = networkAclNameToIdLookup[subnetObject.networkAclName];
        subnetToNetworkAclPromises.push(this.replaceNetworkAclAssociation(networkAclId, subnetId));
      }

      await BlueBirdPromise.all(subnetToNetworkAclPromises);
      internetGatewayId = await this.createAndAttachInternetGateway(vpcId, `${config.name} - Internet Gateway`, environment);

      //Create Route Table and associate it with Subnets
      routeTableId = await this.createRouteTable(vpcId, `${config.name} - Route Table`, environment);
      await this.addInternetGatewayToRouteTable(internetGatewayId, routeTableId);

      //associate subnets with route table
      let subnetAssociationPromises = [];
      for (let subnetIndex = 0; subnetIndex < subnetIds.length; subnetIndex++) {
        subnetAssociationPromises.push(this.associateSubnetWithRouteTable(routeTableId, subnetIds[subnetIndex]));
      }

      await BlueBirdPromise.all(subnetAssociationPromises);
    }

    // If DB peering destination provided, create peering connection and new route
    if(__.has(config, 'peeringConnection.id') && __.has(config, 'peeringConnection.destinationCidrBlock')) {
      await this.createOrUpdatePeeringConnection(config.peeringConnection.id, routeTableId, config.peeringConnection.destinationCidrBlock);
    }
    return vpcId;
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
   * @param peeringConnectionId
   * @param routeTableId
   * @param destinationCidrBlock Target range for the VPC, in CIDR notation. For example, 10.0.0.0/16
   */
  async createOrUpdatePeeringConnection(peeringConnectionId, routeTableId, destinationCidrBlock) {

    try {
      let params = {
        DryRun: false,
        Filters: [
          {
            Name: 'status-code',
            Values: [
              'pending-acceptance'
            ]
          }
        ],
        VpcPeeringConnectionIds: [
          peeringConnectionId
        ]
      };

      const peeringConnectionData = await this._awsEc2Client.describeVpcPeeringConnections(params).promise();

      if(__.isEmpty(peeringConnectionData.VpcPeeringConnections)) {
        this.logMessage('No pending peering connections were found. No action taken.');
      } else {
        this.logMessage('Accepting peering connection request');
        await this._acceptVpcPeeringConnection(peeringConnectionId);
      }

      this.logMessage(`Checking if route exists [id: ${routeTableId}]`);
      const routeTableData = await this._describeRouteTables(peeringConnectionId, routeTableId);

      if(!__.isEmpty(routeTableData.RouteTables)) {
        this.logMessage(`Route already exists. No action taken [RouteTableId: ${routeTableId}]`);
      } else {
        this.logMessage(`Route does not exist. Creating route [RouteTableId: ${routeTableId}]`);
        await this._createRoute(destinationCidrBlock, routeTableId, peeringConnectionId);
      }
    } catch (err) {
      this.logMessage(`CreatePeeringConnectionError Error: ${JSON.stringify(err)}`);
      throw err;
    }
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
   * @param environment
   */
  async createVpc(name, environment, cidrBlock) {

    try {
      let params = {
        CidrBlock: cidrBlock, /* required */
        DryRun: false,
        InstanceTenancy: 'default'//'default | dedicated | host'
      };

      this.logMessage('Creating VPC');
      const createdVpcData = await this._awsEc2Client.createVpc(params).promise();
      const vpcId = createdVpcData.Vpc.VpcId;

      this.logMessage(`VPC Created [VpcId: ${vpcId}]`);
      let vpcAvailableParams = {
        VpcIds: [vpcId]
      };

      await this._awsEc2Client.waitFor('vpcAvailable', vpcAvailableParams).promise();
      //assign tags
      let tags = [
        { Key: 'Name', Value: name },
        { Key: 'Environment', Value: environment },
      ];

      await this._createTags(vpcId, tags);
      await this._modifyVpcAttributes(vpcId, true, true);
      return vpcId;

    } catch (err) {
      this.logError(`CreateVPC Error: ${JSON.stringify(err)}`);
      throw err;
    }

  }

  /**
   *
   * @param name
   * @returns {Promise<*>}
   */
  async getVpcIdFromName(name) {
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
    const result = await this._awsEc2Client.describeVpcs(params).promise();

    if(result && result.Vpcs && result.Vpcs.length > 0) {
      return result.Vpcs[0].VpcId;
    } else {
      return '';
    }
  }

  /**
   *
   * @param vpcId
   * @returns {Promise<*>}
   */
  async getRouteTableByVpcId(vpcId) {
    let params = {
      DryRun: false,
      Filters: [
        {
          Name: 'vpc-id',
          Values: [
            vpcId
          ]
        }
      ]
    };

    this.logMessage(`Looking up RouteTableId by vpcId. [vpcId: ${vpcId}]`);
    const result = await this._awsEc2Client.describeRouteTables(params).promise();

    if(result && result.RouteTables && result.RouteTables.length > 0) {
      return result.RouteTables[0].RouteTableId;
    } else {
      return '';
    }
  }

  /**
   * Returns list of SubnetIds
   * @param vpcId
   * @param subnetNames
   * @return {Promise}
   */
  async getSubnetIdsFromSubnetName(vpcId, subnetNames) {

    let lookupValues = subnetNames;
    if(!__.isArray(subnetNames)) {
      lookupValues = [subnetNames];
    }

    let params = {
      DryRun: false,
      Filters: [
        {
          Name: 'tag:Name',
          Values: lookupValues
        },
        {
          Name: 'vpc-id',
          Values: [vpcId]
        }
      ]
    };

    this.logMessage(`Looking up Subnets by name. [VpcId: ${vpcId}] [SubnetName Lookup Values: ${JSON.stringify(lookupValues)}]`);
    const result = await this._awsEc2Client.describeSubnets(params).promise();

    if(result && result.Subnets && result.Subnets.length > 0) {
      let subnetIds = [];
      for(let itemIndex = 0; itemIndex < result.Subnets.length; itemIndex++) {
        subnetIds.push(result.Subnets[itemIndex].SubnetId);
      }
      return subnetIds;
    } else {
      return [];
    }
  }

  /**
   * Returns the SubnetId
   * @param vpcId
   * @param name
   * @param environment
   * @param cidrBlock
   * @param availabilityZone
   * @param mapPublicIpOnLaunch
   * @return
   */
  async createVpcSubnet(vpcId, name, environment, cidrBlock, availabilityZone, mapPublicIpOnLaunch = true) {
    this.logMessage(`Creating Vpc Subnet. [VpcId: ${vpcId}] [VpcSubnetName: ${name}] [Environment: ${environment}] [CidrBlock: ${cidrBlock}] [AvailabilityZone: ${availabilityZone}]`);
    let params = {
      CidrBlock: cidrBlock,
      AvailabilityZone: availabilityZone,
      VpcId: vpcId,
      DryRun: false
    };
    const createdSubnet = await this._awsEc2Client.createSubnet(params).promise();

    let subnetId = createdSubnet.Subnet.SubnetId;
    this.logMessage(`Creating Vpc Subnet Id. [SubnetId: ${subnetId}]`);

    //assign tags
    let tags = [
      { Key: 'Name', Value: name },
      { Key: 'Environment', Value: environment },
    ];

    await this._createTags(subnetId, tags);
    await this._setMapPublicIpOnLaunchAttribute(subnetId, mapPublicIpOnLaunch);
    return subnetId;
  }

  /**
   * Returns InternetGatewayId
   * @param vpcId
   * @param name
   * @param environment
   * @returns {Promise}
   */
  async createAndAttachInternetGateway(vpcId, name, environment) {
    let params = {};

    this.logMessage(`Creating Internet Gateway. [VpcId: ${vpcId}]`);
    const createdGateway = await this._awsEc2Client.createInternetGateway(params).promise();

    let internetGatewayId = createdGateway.InternetGateway.InternetGatewayId;

    let tags = [
      { Key: 'Name', Value: name },
      { Key: 'Environment', Value: environment },
    ];
    await this._createTags(internetGatewayId, tags);

    this.logMessage(`Attaching InternetGateway to VPC. [VpcId: ${vpcId}] [InternetGatewayId: ${internetGatewayId}]`);

    let attachGatewayParams = {
      InternetGatewayId: internetGatewayId,
      VpcId: vpcId
    };

    await this._awsEc2Client.attachInternetGateway(attachGatewayParams).promise();
    return internetGatewayId;
  }

  /**
   *
   * @param vpcId
   * @param name
   * @param environment
   * @returns {Promise}
   */
  async createRouteTable(vpcId, name, environment) {
    let params = {
      VpcId: vpcId
    };

    this.logMessage(`Creating RouteTable. [VpcId: ${vpcId}] [RouteTableName: ${name}]`);
    const createdRouteTable = await this._awsEc2Client.createRouteTable(params).promise();

    let routeTableId = createdRouteTable.RouteTable.RouteTableId;

    //assign tags
    let tags = [
      { Key: 'Name', Value: name },
      { Key: 'Environment', Value: environment },
    ];

    await this._createTags(routeTableId, tags);
    return routeTableId;
  }

  /**
   * Associates the Internet Gateway with a specific Route Table
   * @param internetGatewayId
   * @param routeTableId
   * @returns {Promise<EC2.Types.CreateRouteResult>}
   */
  async addInternetGatewayToRouteTable(internetGatewayId, routeTableId) {
    let params = {
      DestinationCidrBlock: '0.0.0.0/0',
      GatewayId: internetGatewayId,
      RouteTableId: routeTableId
    };
    const createdRoute = await this._awsEc2Client.createRoute(params).promise();

    this.logMessage(`Adding Internet Gateway to RouteTable. [RouteTableId: ${routeTableId}] [InternetGatewayId: ${internetGatewayId}]`);
    return createdRoute;
  }

  /**
   *
   * @param routeTableId
   * @param subnetId
   * @returns {Promise<EC2.Types.AssociateRouteTableResult>}
   */
  async associateSubnetWithRouteTable(routeTableId, subnetId) {
    let params = {
      RouteTableId: routeTableId, /* required */
      SubnetId: subnetId, /* required */
      DryRun: false
    };

    this.logMessage(`Associating Subnet with RouteTable. [RouteTableId: ${routeTableId}] [SubnetId: ${subnetId}]`);
    return await this._awsEc2Client.associateRouteTable(params).promise();
  }

  /**
   *
   * @param vpcId
   * @param name
   * @param environment
   * @param networkAclRules
   * @returns {Promise}
   */
  async createNetworkAclWithRules(vpcId, name, environment, networkAclRules) {
    let params = {
      VpcId: vpcId
    };

    this.logMessage(`Creating NetworkAcl. [VpcId: ${vpcId}] [Name: ${name}]`);
    const createdNetworkAcl = await this._awsEc2Client.createNetworkAcl(params).promise();

    let networkAclId = createdNetworkAcl.NetworkAcl.NetworkAclId;

    //assign tags
    let tags = [
      { Key: 'Name', Value: name },
      { Key: 'Environment', Value: environment },
    ];

    await this._createTags(networkAclId, tags);

    let createNetworkAclEntryPromises = [];
    //create rules on NetworkAcl
    for(let networkAclRuleIndex = 0; networkAclRuleIndex < networkAclRules.length; networkAclRuleIndex++) {
      let ruleObject = networkAclRules[networkAclRuleIndex];
      createNetworkAclEntryPromises.push(this.createNetworkAclRule(networkAclId, ruleObject.cidrBlock, ruleObject.egress, ruleObject.protocol, ruleObject.ruleAction, ruleObject.ruleNumber));
    }

    await BlueBirdPromise.all(createNetworkAclEntryPromises);
    return networkAclId;
  }

  /**
   *
   * @param networkAclId This is the networkAclId that the rule will be added to
   * @param cidrBlock This is the CIDR Block where the rule will be applied
   * @param egress If false, applies to inbound, if true, applies to outbound traffic
   * @param protocol -1 means all protocols
   * @param ruleAction This is a string which can be 'allow | deny'
   * @param ruleNumber This is the rule number
   */
  async createNetworkAclRule(networkAclId, cidrBlock, egress, protocol, ruleAction, ruleNumber) {

    /*
      egress = true => outbound
      egress = false => inbound
     */
    let params = {
      CidrBlock: cidrBlock, /* required */
      Egress: egress, /* required */
      NetworkAclId: networkAclId, /* required */
      Protocol: protocol, /* required */
      RuleAction: ruleAction, /* required */
      RuleNumber: ruleNumber, /* required */
      DryRun: false,
      PortRange: {
        From: 0,
        To: 0
      }
    };

    return await this._awsEc2Client.createNetworkAclEntry(params).promise();
  }

  /**
   * Replaces a subnet's Network ACL associate with the given network ACL
   * @param networkAclId
   * @param subnetId
   * @return {Promise.<TResult>|*}
   */
  async replaceNetworkAclAssociation(networkAclId, subnetId) {

    const associationId = await this._findCurrentNetworkAclAssociationIdForSubnetId(subnetId);

    let params = {
      AssociationId: associationId, /* required */
      NetworkAclId: networkAclId, /* required */
      DryRun: false
    };

    this.logMessage(`Replacing NetworkAcl Association for Subnet. [SubnetId: ${subnetId}] [AssociationId: ${associationId}] [New NetworkAclId: ${networkAclId}]`);
    return await this._awsEc2Client.replaceNetworkAclAssociation(params).promise();
  }

  /**
   * Finds the NetworkAclAssociationId associated with the subnet
   * @param subnetId
   * @return {Promise}
   * @private
   */
  async _findCurrentNetworkAclAssociationIdForSubnetId(subnetId) {
    let params = {
      DryRun: false,
      Filters: [
        {
          Name: 'association.subnet-id',
          Values: [ subnetId ]
        }
      ]
    };

    const networkAclsResult = await this._awsEc2Client.describeNetworkAcls(params).promise();

    this.logMessage(`Looking up NetworkAclAssociationId for Subnet. [SubnetId: ${subnetId}]`);

    let returnValue = '';
    this.logMessage(`Subnet NetworkAcls Lookup. [Result: ${JSON.stringify(networkAclsResult)}]`);
    if(networkAclsResult && networkAclsResult.NetworkAcls && networkAclsResult.NetworkAcls.length > 0) {
      let networkAclAssociations = networkAclsResult.NetworkAcls[0].Associations;
      let subnetAssociationObject = __.find(networkAclAssociations, {'SubnetId': subnetId});
      if(subnetAssociationObject) {
        returnValue = subnetAssociationObject.NetworkAclAssociationId;
      }
    }
    return returnValue;
  }

  /**
   *
   * @param subnetId
   * @param value This is the flag to set for the MapPublicIpOnLaunch. True sets the value to yes, false sets the value to no
   * @return {Promise<{}>}
   * @private
   */
  async _setMapPublicIpOnLaunchAttribute(subnetId, value = true) {
    let params = {
      SubnetId: subnetId, /* required */
      MapPublicIpOnLaunch: {
        Value: value
      }
    };

    return await this._awsEc2Client.modifySubnetAttribute(params).promise();
  }

  /**
   *
   * @param vpcId
   * @param enableDnsHostnames
   * @param enableDnsSupport
   * @return {*}
   * @private
   */
  async _modifyVpcAttributes(vpcId, enableDnsHostnames = true, enableDnsSupport = true) {
    let enableDnsHostnamesParams = {
      VpcId: vpcId, /* required */
      EnableDnsHostnames: {
        Value: enableDnsHostnames
      }
    };

    let enableDnsSupportParams = {
      VpcId: vpcId, /* required */
      EnableDnsSupport: {
        Value: enableDnsSupport
      }
    };


    this.logMessage(`Setting VPC Attributes. [VpcId: ${vpcId}] [EnableDnsHostnames: ${enableDnsHostnames}] [EnableDnsSupport: ${enableDnsSupport}]`);
    await this._awsEc2Client.modifyVpcAttribute(enableDnsHostnamesParams).promise();
    await this._awsEc2Client.modifyVpcAttribute(enableDnsSupportParams).promise();
  }

  /**
   *
   * @param resourceId
   * @param tags Array of objects which contain a Key and Value key
   * @param addCreatedTag
   * @returns {Promise.<TResult>}
   * @private
   */
  async _createTags(resourceId, tags, addCreatedTag = true) {

    let localTags = tags;
    if(!__.isArray(localTags)) {
      localTags = [];
    }

    if(addCreatedTag) {
      localTags.push({ Key: 'Created', Value:  moment().format()});
    }

    //assign tags
    let createTagParams = {
      Resources: [ resourceId ],
      Tags: localTags,
      DryRun: false
    };

    this.logMessage(`Assigning Tags to ResourceId. [ResourceId: ${resourceId}] [Tags: ${JSON.stringify(localTags)}]`);
    return await this._awsEc2Client.createTags(createTagParams).promise();
  }

  /**
   *
   * @param peeringConnectionId
   * @param routeTableId
   * @returns {Promise.<TResult>}
   * @private
   */
  async _describeRouteTables(peeringConnectionId, routeTableId) {
    let params = {
      DryRun: false,
      Filters: [
        {
          Name: 'route.vpc-peering-connection-id',
          Values: [
            peeringConnectionId
          ]
        }
      ],
      RouteTableIds: [
        routeTableId
      ]
    };
    return await this._awsEc2Client.describeRouteTables(params).promise();
  }

  /**
   *
   * @param peeringConnectionId
   * @returns {Promise.<TResult>}
   * @private
   */
  async _acceptVpcPeeringConnection(peeringConnectionId) {
    let params = {
      DryRun: false,
      VpcPeeringConnectionId: peeringConnectionId
    };
    return await this._awsEc2Client.acceptVpcPeeringConnection(params).promise();
  }

  /**
   *
   * @param destinationCidrBlock
   * @param routeTableId
   * @param peeringConnectionId
   * @returns {Promise.<TResult>}
   * @private
   */
  async _createRoute(destinationCidrBlock, routeTableId, peeringConnectionId) {
    let params = {
      DestinationCidrBlock: destinationCidrBlock,
      RouteTableId: routeTableId,
      VpcPeeringConnectionId: peeringConnectionId
    };
    return await this._awsEc2Client.createRoute(params).promise();
  }
}

module.exports = VpcClient;
