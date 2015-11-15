/// <reference path="./typings/bundle.d.ts" />

import { task, src, dest, watch } from 'gulp';
import * as glob from 'glob';
import * as ts from 'gulp-typescript';
import * as tslint from 'gulp-tslint';
import * as browserify from 'browserify';
const source = require('vinyl-source-stream');
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
	'build:less',
	'build-copy',
	'build-frontside-scripts'
]);

task('build:ts', () => {
	return tsProject.src()
		.pipe(ts(tsProject))
		.pipe(babel({
			modules: 'commonStrict'
		}))
		.pipe(dest('./built'));
});

task('build-frontside:ls', () => {
	return src('./src/sites/*/resources/scripts/**/*.ls')
		.pipe(ls())
		.pipe(uglify())
		.pipe(dest('./tmp/frontside'));
});

task('build-frontside:js', () => {
	return src('./src/sites/*/resources/scripts/**/*.js')
		.pipe(uglify())
		.pipe(dest('./tmp/frontside'));
});

task('build-frontside-scripts', ['build-frontside:ls', 'build-frontside:js'], () => {
	return glob('./tmp/frontside/*/resources/scripts/**/*.js', (err: Error, files: string[]) => {
		files.map((entry: string) => {
			browserify({ entries: [entry] })
				.bundle()
				.pipe(source(entry.replace('/tmp/frontside/', '/sites/')))
				.pipe(dest('./built'));
		});
	});
});

task('build:less', () => {
	return src('./src/**/*.less')
		.pipe(less())
		.pipe(minifyCSS())
		.pipe(dest('./built'));
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
