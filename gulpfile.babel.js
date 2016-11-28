"use strict";
let gulp = require('gulp');
let runSequence = require('run-sequence').use(gulp);
let plugins = require('gulp-load-plugins')();//loads all plugins matching gulp-*
let del = require('del');
let gulpUtil = require('gulp-util');
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
  return del([`build/**/*`, `build/**/*`]);
});

gulp.task('build:lint', () => {
  return gulp.src('src/**/*.js')
    .pipe(plugins.jshint({
      "node": true,
      "esnext": 6
    }))
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('build:babel', (callback) => {
  gulp.src(['src/**/*.js'], {base: "./src"})
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel({presets: ['es2015']}))
    .pipe(plugins.sourcemaps.write("."))
    .pipe(gulp.dest('build'))
    .on('end', () => {
      callback()
    });
});

gulp.task('test', () => {
  let mochaOptions = {
    compilers: 'js:babel-core/register'
  };

  return gulp.src('./tests/**.js', {read: false})
    .pipe(mocha(mochaOptions));
});