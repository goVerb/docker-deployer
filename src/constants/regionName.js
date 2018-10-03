module.exports = function() {
  const amiTable = {
    'us-east-1': {
      region: 'us-east-1',
      name: 'N. Virginia Region'
    },
    'us-east-2': {
      region: 'ami-58f5db3d',
      name: 'Ohio Region'
    },
    'us-west-1': {
      region: 'us-west-1',
      name: 'N. California Region'
    },
    'us-west-2': {
      region: 'us-west-2',
      name: 'Oregon Region'
    },
    'eu-west-1': {
      region: 'eu-west-1',
      name: 'Ireland Region'
    },
    'eu-west-2': {
      region: 'eu-west-2',
      name: 'London Region'
    },
    'eu-west-3': {
      region: 'eu-west-3',
      name: 'Paris Region'
    },
    'eu-central-1': {
      region: 'eu-central-1',
      name: 'Frankfurt Region'
    },
    'ap-northeast-1': {
      region: 'ap-northeast-1',
      name: 'Tokyo Region'
    },
    'ap-northeast-2': {
      region: 'ap-northeast-2',
      name: 'Seoul Region'
    },
    'ap-northeast-3': {
      region: 'ap-northeast-3',
      name: 'Osaka-Local Region'
    },
    'ap-southeast-1': {
      region: 'ap-southeast-1',
      name: 'Singapore Region'
    },
    'ap-southeast-2': {
      region: 'ap-southeast-2',
      name: 'Sydney Region'
    },
    'ap-south-1': {
      region: 'ap-south-1',
      name: 'Mumbai Region'
    },
    'ca-central-1': {
      region: 'ca-central-1',
      name: 'Canada Central Region'
    },
    'sa-east-1': {
      region: 'sa-east-1',
      name: 'São Paulo Region'
    }
  };
  return {
    ...amiTable,
  
    /**
     *
     * @param region
     * @returns {*}
     */
    getName: (region) => {
      return amiTable[region].name;
    }
  };
}();
