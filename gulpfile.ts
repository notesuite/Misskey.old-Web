/// <reference path="./typings/bundle.d.ts" />

import { task, src, dest, watch } from 'gulp';
import * as glob from 'glob';
import * as ts from 'gulp-typescript';
import * as tslint from 'gulp-tslint';
import * as browserify from 'browserify';
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const transform = require('vinyl-transform');
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
	'copy:frontside-templates',
	'build:frontside-scripts',
	'build:frontside-styles',
	'build-copy'
]);

task('build:ts', () => {
	return tsProject.src()
		.pipe(ts(tsProject))
		.pipe(babel())
		.pipe(dest('./built'));
});

task('compile:frontside-scripts', () => {
	return es.merge(
		src(['./src/sites/*/common/**/*.ls', './src/sites/*/pages/**/*.ls'])
			.pipe(ls()),
		src(['./src/sites/*/common/**/*.js', './src/sites/*/pages/**/*.js', '!./src/sites/*/pages/**/controller.js'])
	).pipe(dest('./tmp/'));
});

task('copy:frontside-templates', () => {
	return src('./src/sites/**/common/views/**/*.jade')
		.pipe(dest('./tmp/'))
});

task('build:frontside-scripts', ['copy:frontside-templates', 'compile:frontside-scripts'], done => {
	glob('./tmp/**/*.js', (err: Error, files: string[]) => {
		const tasks = files.map((entry: string) => {
			return browserify({ entries: [entry] })
				.bundle()
				.pipe(source(entry.replace('tmp', 'resources')))
				//.pipe(buffer())
				//.pipe(uglify())
				.pipe(dest('./built'));
		});
		es.merge(tasks).on('end', done);
	});
});

task('build:frontside-styles', () => {
	return src('./src/sites/**/*.less')
		.pipe(less())
		.pipe(minifyCSS())
		.pipe(dest('./built/resources'));
});

task('lint', () => {
	return src('./src/**/*.ts')
		.pipe(tslint(<any>{
			tslint: require('tslint')
		}))
		.pipe(tslint.report('verbose'));
});

task('build-copy', ['build:frontside-scripts'], () => {
	src(['./src/sites/*/common/**/*', './src/sites/*/pages/**/*'])
		.pipe(dest('./built/resources'));
	src([
		'./src/**/*',
		'!./src/**/*.ts',
		'!./src/**/*.ls',
		'!./src/**/*.js'
	]).pipe(dest('./built'));
	src('./resources/**/*').pipe(dest('./built/resources/common/'));
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
