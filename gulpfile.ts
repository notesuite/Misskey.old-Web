/// <reference path="./typings/bundle.d.ts" />

(<any>Error).stackTraceLimit = Infinity;

import {task, src, dest} from 'gulp';
import * as glob from 'glob';
import * as ts from 'gulp-typescript';
import * as tslint from 'gulp-tslint';
import * as browserify from 'browserify';
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const es = require('event-stream');
const stylus = require('gulp-stylus');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');

task('build', [
	'build:ts',
	'copy:bower_components',
	'build:frontside-scripts',
	'build:frontside-styles',
	'build-copy'
]);

const project = ts.createProject('tsconfig.json', {
	typescript: require('typescript')
});

function buildTypeScript(): ts.CompilationStream {
	return project.src().pipe(ts(project));
}

task('build:ts', () =>
	buildTypeScript()
		.pipe(dest('./built/'))
);

task('copy:bower_components', () => {
	return src('./bower_components/**/*')
		.pipe(dest('./built/resources/bower_components/'));
});

task('build:frontside-scripts', done => {
	glob('./src/web/**/*.ls', (err: Error, files: string[]) => {
		const tasks = files.map(entry => {
			return browserify({ entries: [entry] })
				.bundle()
				.pipe(source(entry.replace('src/web', 'resources').replace('.ls', '.js')))
				.pipe(buffer())
				.pipe(uglify())
				.pipe(dest('./built'));
		});
		es.merge(tasks).on('end', done);
	});
});

task('build:frontside-styles', ['copy:bower_components'], () => {
	return src('./src/web/**/*.styl')
		.pipe(stylus())
		.pipe(cssnano({
			safe: true // 高度な圧縮は無効にする (一部デザインが不適切になる場合があるため)
		}))
		.pipe(dest('./built/resources/'));
});

task('build-copy', ['build:ts', 'build:frontside-scripts', 'build:frontside-styles'], () => {
	return es.merge(
		src([
			'./src/web/**/*.styl',
			'./src/web/**/*.ts',
			'./src/web/**/*.jade'
		]).pipe(dest('./built/web/')),
		src('./src/resources/**/*').pipe(dest('./built/resources/')),
		src([
			'./src/web/**/*',
			'!./src/web/**/*.js',
			'!./src/web/**/*.ts',
			'!./src/web/**/*.ls'
		]).pipe(dest('./built/resources/'))
	);
});
