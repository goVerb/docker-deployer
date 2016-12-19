module.exports = function(wallaby) {
  return {
    files: ['src/**/*.js', 'tests/sampleConfigs/*.js'],
    tests: ['tests/*.js'],
    env: {
      type: 'node',
      runner: 'node'
    },
    testFramework: 'mocha',
    compilers: {
      '**/*.js': wallaby.compilers.babel()
    }
  };
};
