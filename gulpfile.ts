/// <reference path="./typings/bundle.d.ts" />

import { task, src, dest, watch } from 'gulp';
import * as ts from 'gulp-typescript';
import * as tslint from 'gulp-tslint';
import * as del from 'del';
const babel = require('gulp-babel');
const ls = require('gulp-livescript');

const tsProject = ts.createProject('tsconfig.json', <any>{
	typescript: require('typescript')
});

task('watch', ['build', 'lint'], () => {
	watch('./src/**/*.ts', ['build:ts', 'lint']);
});

task('build', ['build:ts', 'build:ls', 'build-copy']);

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
	return src(['./src/**/*', '!./src/**/*.ts'])
		.pipe(dest('./built'));
});

task('clean', cb => {
	del(['./built', './tmp'], cb);
});

task('clean-all', ['clean'], cb => {
	del(['./node_modules', './typings'], cb);
});

task('test', ['build', 'lint']);
