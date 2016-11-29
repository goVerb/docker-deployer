const babel = require('babel-core');

module.exports = function (wallaby) {
  return {
    files: ["src/**/*.js"],
    tests: ["tests/*.js"],
    env: {
      type: "node",
      runner: "node"
    },
    testFramework: "mocha",
    compilers: {
      '**/*.js': wallaby.compilers.babel({
        babel: babel,
        presets: ['es2015']
      })
    }
  };
};
