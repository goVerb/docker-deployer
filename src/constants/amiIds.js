module.exports = () => {
  const amiTable = {
    'us-east-1': {
      id: 'ami-007571470797b8ffa',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'us-east-2': {
      id: 'ami-0aa9ee1fc70e57450',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'us-west-1': {
      id: 'ami-62e0d802',
      name: 'amzn-ami-2017.09.d-amazon-ecs-optimized'
    },
    'us-west-2': {
      id: 'ami-7114c909',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'eu-west-1': {
      id: 'ami-0b8e62ddc09226d0a',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'eu-west-2': {
      id: 'ami-0380c676fcff67fd5',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'eu-west-3': {
      id: 'ami-0b419de35e061d9df',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'eu-central-1': {
      id: 'ami-01b63d839941375df',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'ap-northeast-1': {
      id: 'ami-086ca990ae37efc1b',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'ap-northeast-2': {
      id: 'ami-0c57dafd95a102862',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'ap-southeast-1': {
      id: 'ami-0627e2913cf6756ed',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },  
    'ap-southeast-2': {
      id: 'ami-0d28e5e0f13248294',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'ap-south-1': {
      id: 'ami-05de310b944d67cde',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'ca-central-1': {
      id: 'ami-0835b198c8a7aced4',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    },
    'sa-east-1': {
      id: 'ami-09987452123fadc5b',
      name: 'amzn2-ami-ecs-hvm-2.0.20190301-x86_64-ebs'
    }
  };
  return {
    ...amiTable,
    getIdByRegion: (region) => {
      return amiTable[region].id;
    }
  };
};
