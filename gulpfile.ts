/// <reference path="./typings/bundle.d.ts" />

import { task, src, dest, watch } from 'gulp';
import * as glob from 'glob';
import * as ts from 'gulp-typescript';
import * as tslint from 'gulp-tslint';
import * as browserify from 'browserify';
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const transform = require('vinyl-transform');
const gulpBrowser = require("gulp-browser");
const es = require('event-stream');
// import * as del from 'del';
const babel = require('gulp-babel');
const less = require('gulp-less');
const minifyCSS = require('gulp-minify-css');
const ls = require('gulp-livescript');
const uglify = require('gulp-uglify');

const tsProject = ts.createProject('tsconfig.json', <any>{
	typescript: require('typescript')
});

task('watch', ['build', 'lint'], () => {
	watch('./src/**/*.ts', ['build:ts', 'lint']);
});

task('build', [
	'build:ts',
	'build:frontside-scripts'
]);

task('build:ts', () => {
	return tsProject.src()
		.pipe(ts(tsProject))
		.pipe(babel())
		.pipe(dest('./built'));
});

task('build:frontside-scripts', () => {
	return es.merge(
		src(['./src/sites/*/common/**/*.ls', './src/sites/*/pages/**/*.ls'])
			.pipe(ls()),
		src(['./src/sites/*/common/**/*.js', './src/sites/*/pages/**/*.js'])
	).pipe(gulpBrowser.browserify())
	//.pipe(buffer())
	//.pipe(uglify())
	.pipe(dest('./a/'));
});

task('build:frontside-styles', () => {
	return src('./src/**/*.less')
		.pipe(less())
		.pipe(minifyCSS())
		.pipe(dest('./tmp/build-resources'));
});

task('lint', () => {
	return src('./src/**/*.ts')
		.pipe(tslint(<any>{
			tslint: require('tslint')
		}))
		.pipe(tslint.report('verbose'));
});

task('build-copy', () => {
	return src([
		'./src/**/*',
		'!./src/**/*.ts',
		'!./src/**/*.ls',
		'!./src/**/*.js'
	]).pipe(dest('./built'));
});


/*
task('clean', cb => {
	del(['./built', './tmp'], cb);
});

task('clean-all', ['clean'], cb => {
	del(['./node_modules', './typings'], cb);
});
*/

task('test', ['build', 'lint']);
