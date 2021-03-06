# docker-deployer


## Create Infrastructure / Deploy
This is the sample JSON configs required to create infrastructure
```
let vpcDefinition = {
  name: 'APP VPC',
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
  name: 'APP ALB SG',
  description: 'Applied to the application load balancer for the APP ECS Cluster.',
  vpcName: vpcDefinition.name,
  rules: [
    {egress: false, protocol: '-1', fromPort: 0, toPort: 65535, allowedIpCidrBlock: '0.0.0.0/0'}
  ]
};

let ec2SecurityGroupDefinition = {
  name: 'APP EC2 SG',
  description: 'Applied to the EC2 instances for the APP ECS Cluster.',
  vpcName: vpcDefinition.name,
  rules: [
    {egress: false, protocol: 'tcp', fromPort: 32768, toPort: 51677, allowedSecurityGroupName: elbSecurityGroupDefinition.name},
    {egress: false, protocol: 'tcp', fromPort: 51680, toPort: 61000, allowedSecurityGroupName: elbSecurityGroupDefinition.name},
    {egress: false, protocol: 'tcp', fromPort: 2375, toPort: 2376, allowedIpCidrBlock: '0.0.0.0/0'},
    {egress: false, protocol: 'tcp', fromPort: 51678, toPort: 51679, allowedIpCidrBlock: '0.0.0.0/0', }
  ]
};

let launchConfigurationDefinition = {
  name: 'APP ECS LC',
  baseImageId: 'ami-7abc111a',
  vpcName: vpcDefinition.name,
  securityGroupName: ec2SecurityGroupDefinition.name,
  instanceType: 't2.micro',
};

let targetGroupDefinition = {
  name: 'APP-Target-Group',
  port: 80,
  protocol: 'HTTP',
  vpcName: vpcDefinition.name,
  healthCheckSettingOverrides: {
    HealthCheckPath: '/health'
  }
};

let applicationLoadBalancerDefinition = {
  name: 'APP-ECS-App-Load-Balancer',
  scheme: 'internet-facing',
  securityGroupName: elbSecurityGroupDefinition.name,
  vpcName: vpcDefinition.name,
  vpcSubnets: ['Instance Subnet 1', 'Instance Subnet 2']
};

let infrastructureDefinition = {
  environment: 'Dev',
  dnsHostname: 'yourapi.dev-internal.yoursite.com',
  ecsClusterName: 'APP-Cluster',
  vpc: vpcDefinition,
  securityGroups: [elbSecurityGroupDefinition, ec2SecurityGroupDefinition],
  launchConfiguration: launchConfigurationDefinition,
  targetGroup: targetGroupDefinition,
  autoScaleGroup: {
    name: 'APP-ECS-ASG',
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
  name: 'APP-API-Container',
  image: '000000000000.dkr.ecr.us-west-2.amazonaws.com/your-api:beta1',
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
  taskName: 'APP-API-Task',
  networkMode: 'bridge',
  taskRoleArn: 'arn:aws:iam::000000000000:role/ecsTaskRole',
  containerDefintions: containerDefinitions
};

let serviceDefinition = {
  clusterName: infrastructureDefinition.ecsClusterName,
  serviceName: 'APP-ECS-Service',
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
  cname: 'api.dev.yoursite.com',
  comment: 'title',
  originName: 'APP API Gateway - Dev',
  originDomainName: 'apigatewayID.execute-api.us-west-2.amazonaws.com',
  originPath: '/'
}
```



## deployLambda

Input
```
 {
  region:"us-west-6",
  handler:"index.handler",
  role:"arn:aws:iam::80981928390183:role/lambda_basic_execution",
  functionName:"some-lambda-name",
  timeout:100,
  memorySize:256,
  publish:true,
  runtime:"nodejs6.10",
  zipFileName: /some/absolute/path/to/zip/dist.zip',
  environments: [
    {
      name: 'dev',
      variables: {
        host: 'https://sampledev.yoursite.com'
      }
    },
    {
      name: 'demo',
      variables: {
        host: 'https://sampledemo.yoursite.com'
      }
    },
    {
      name: 'prod',
      variables: {
        host: 'https://sampleapp.yoursite.com'
      }
    }
  ],
  logging: {
    Principal: 'logs.us-west-6.amazonaws.com',
    LambdaFunctionName: 'lambda-logger',
    Arn: 'arn:aws:lambda:us-west-2:80981928390183:function:lambda-logger'
  },
  schedule: {
    ruleName: 'deci rate',
    ruleDescription: 'some description',
    ruleScheduleExpression: 'rate(10 minutes)'
  }
}
```
