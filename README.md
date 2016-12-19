# docker-deployer


## Create Infrastructure / Deploy
This is the sample JSON configs required to create infrastructure
```
let vpcDefinition = {
  name: '***REMOVED*** VPC',
  cidrBlock: '10.0.0.0/16',
  subnets: [
    { name: 'Instance Subnet 1', cidrBlock: '10.0.2.0/24', availabilityZone: 'us-west-2a', networkAclName: 'Instance Network Acl'},
    { name: 'Instance Subnet 2', cidrBlock: '10.0.4.0/24', availabilityZone: 'us-west-2b', networkAclName: 'Instance Network Acl'}
  ],
  networkAcls: [
    {
      name: 'Instance Network Acl',
      rules: [
        { cidrBlock: '0.0.0.0/0', egress: false, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 },
        { cidrBlock: '0.0.0.0/0', egress: true, protocol: '-1', ruleAction: 'allow', ruleNumber: 100 }
      ]
    }
  ]
};

let elbSecurityGroupDefinition = {
  name: '***REMOVED*** ALB SG',
  description: 'Applied to the application load balancer for the ***REMOVED*** ECS Cluster.',
  vpcName: vpcDefinition.name,
  rules: [
    {egress: false, protocol: '-1', fromPort: 0, toPort: 65535, allowedIpCidrBlock: '0.0.0.0/0'}
  ]
};

let ec2SecurityGroupDefinition = {
  name: '***REMOVED*** EC2 SG',
  description: 'Applied to the EC2 instances for the ***REMOVED*** ECS Cluster.',
  vpcName: vpcDefinition.name,
  rules: [
    {egress: false, protocol: 'tcp', fromPort: 32768, toPort: 51677, allowedSecurityGroupName: elbSecurityGroupDefinition.name},
    {egress: false, protocol: 'tcp', fromPort: 51680, toPort: 61000, allowedSecurityGroupName: elbSecurityGroupDefinition.name},
    {egress: false, protocol: 'tcp', fromPort: 2375, toPort: 2376, allowedIpCidrBlock: '0.0.0.0/0'},
    {egress: false, protocol: 'tcp', fromPort: 51678, toPort: 51679, allowedIpCidrBlock: '0.0.0.0/0', }
  ]
};

let launchConfigurationDefinition = {
  name: '***REMOVED*** ECS LC',
  baseImageId: 'ami-7abc111a',
  vpcName: vpcDefinition.name,
  securityGroupName: ec2SecurityGroupDefinition.name,
  instanceType: 't2.micro',
};

let targetGroupDefinition = {
  name: '***REMOVED***-Target-Group',
  port: 80,
  protocol: 'HTTP',
  vpcName: vpcDefinition.name,
  healthCheckSettingOverrides: {
    HealthCheckPath: '/health'
  }
};

let applicationLoadBalancerDefinition = {
  name: '***REMOVED***-ECS-App-Load-Balancer',
  scheme: 'internet-facing',
  securityGroupName: elbSecurityGroupDefinition.name,
  vpcName: vpcDefinition.name,
  vpcSubnets: ['Instance Subnet 1', 'Instance Subnet 2']
};

let infrastructureDefinition = {
  environment: 'Dev',
  dnsHostname: '***REMOVED***api.dev-internal.***REMOVED***.net',
  ecsClusterName: '***REMOVED***-Cluster',
  vpc: vpcDefinition,
  securityGroups: [elbSecurityGroupDefinition, ec2SecurityGroupDefinition],
  launchConfiguration: launchConfigurationDefinition,
  targetGroup: targetGroupDefinition,
  autoScaleGroup: {
    name: '***REMOVED***-ECS-ASG',
    launchConfigurationName: launchConfigurationDefinition.name,
    minSize: 1,
    maxSize: 3,
    desiredSize: 2,
    targetGroupName: targetGroupDefinition.name,
    vpcName: vpcDefinition.name,
    vpcSubnets: ['Instance Subnet 1', 'Instance Subnet 2']
  },
  appLoadBalancer: applicationLoadBalancerDefinition,
  appListener: {
    loadBalancerName: applicationLoadBalancerDefinition.name,
    targetGroupName: targetGroupDefinition.name,
    protocol: 'HTTP',
    certificateArn: '',  /* Optional */
    port: 80
  }
};

let containerDefinitions = [{
  name: '***REMOVED***-API-Container',
  image: '***REMOVED***.dkr.ecr.us-west-2.amazonaws.com/***REMOVED***-api:beta1',
  disableNetworking: false,
  privileged: false,
  readonlyRootFilesystem: true,
  memory: '300',
  memoryReservation: '300',
  essential: true,
  portMappings: [
    {
      containerPort: 8080,
      hostPort: 0,
      protocol: 'tcp'
    }
  ],
  command: [],
  cpu: 0,
  dnsSearchDomains: [],
  dnsServers: [],
  dockerLabels: {},
  dockerSecurityOptions: [],
  entryPoint: [],
  environment: [],
  extraHosts: [],
  hostname: null,
  links: [],
  logConfiguration: {
    logDriver: 'json-file'
  },
  mountPoints: [],
  ulimits: [],
  user: null,
  volumesFrom: [],
  workingDirectory: null
}];

let taskDefinition = {
  taskName: '***REMOVED***-API-Task',
  networkMode: 'bridge',
  taskRoleArn: 'arn:aws:iam::***REMOVED***:role/ecsTaskRole',
  containerDefintions: containerDefinitions
};

let serviceDefinition = {
  clusterName: infrastructureDefinition.ecsClusterName,
  serviceName: '***REMOVED***-ECS-Service',
  taskName: taskDefinition.taskName,
  desiredCount: 2,
  containerName: containerDefinitions[0].name,
  containerPort: 8080,
  targetGroupName: targetGroupDefinition.name
};

let deployer = new Deployer('us-west-2');

deployer.createInfrastructure(infrastructureDefinition).then(() => {
  return deployer.deploy(serviceDefinition, taskDefinition);
}).then(result => {
  console.log(`Done: ${JSON.stringify(result)}`);
});

```


## createCloudfront

Input
```
{
  callerReference: '',
  cname: 'api.dev.***REMOVED***.net',
  comment: 'title',
  originName: '***REMOVED*** API Gateway - Dev',
  originDomainName: '***REMOVED***.execute-api.us-west-2.amazonaws.com',
  originPath: '/'
}
```
