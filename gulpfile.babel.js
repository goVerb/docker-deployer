"use strict";
let gulp = require('gulp');
let runSequence = require('run-sequence').use(gulp);
let plugins = require('gulp-load-plugins')();//loads all plugins matching gulp-*
let del = require('del');
let gulpUtil = require('gulp-util');
let eslint = require('gulp-eslint');
let fs = require('fs');
let mocha = require('gulp-spawn-mocha');
let util = require('util');

gulp.task('npmrc', () => {
  let npmKey = process.env.NPM_KEY;
  fs.writeFileSync('.npmrc', npmKey);
});


gulp.task('build', (callback) => {
  return runSequence(
    'build:lint',
    'build:clean',
    'build:babel',
    callback);
});

gulp.task('build:clean', () => {
  return del(['build/**/*']);
});

gulp.task('build:lint', () => {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.formatEach())
    .pipe(eslint.failAfterError());
});

gulp.task('build:babel', (callback) => {
  gulp.src(['src/**/*.js'], {base: "./src"})
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel())
    .pipe(plugins.sourcemaps.write("."))
    .pipe(gulp.dest('build'))
    .on('end', () => {
      callback();
    });
});

gulp.task('test', () => {

  return executeTest('./tests/**.js');
});


/**
 *
 * @param {string|Array} filePath
 * @param {boolean} [quietMode=false]
 */
let executeTest = (filePath, quietMode = false) => {
  let mochaOptions = {
    require: ['babel-polyfill', 'babel-core/register'],
    timeout: 10000
  };

  if(quietMode) {
    mochaOptions.reporter = 'min';
    mochaOptions.env = {
      ...mochaOptions.env,
      NODE_ENV: 'unittest'
    };
  }

  let processedFilePath = filePath;
  if(!Array.isArray(filePath)) {
    processedFilePath = [filePath];
  }

  return gulp.src(processedFilePath, {
    read: false,
    buffer: false
  }).pipe(mocha(mochaOptions));
};
