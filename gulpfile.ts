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
	'build:ls',
	'build:js',
	'build:less',
	'build-copy',
	'browserify'
]);

task('build:ts', () => {
	return tsProject.src()
		.pipe(ts(tsProject))
		.pipe(babel({
			modules: 'commonStrict'
		}))
		.pipe(dest('./built'));
});

task('build:ls', () => {
	return src('./src/**/*.ls')
		.pipe(ls())
		.pipe(uglify())
		.pipe(dest('./built'));
});

task('build:js', () => {
	return src('./src/**/*.js')
		.pipe(uglify())
		.pipe(dest('./built'));
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

task('browserify', () => {
	return glob('./built/resources/**/*.js', (err: Error, files: string[]) => {
		files.map((entry: string) => {
			browserify({ entries: [entry] })
				.bundle()
				.pipe(source(entry))
				.pipe(dest('./a'));
		});
	});
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
