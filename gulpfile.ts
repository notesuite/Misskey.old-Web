/// <reference path="./typings/bundle.d.ts" />

(<any>Error).stackTraceLimit = Infinity;

import * as fs from 'fs';
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

const env = process.env.NODE_ENV;

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

task('build:public-config', ['build:ts'], done => {
	const config = require('./built/config').default;
	fs.mkdir('./built/_', e => {
		if (!e || (e && e.code === 'EEXIST')) {
			fs.writeFile('./built/_/config.json', JSON.stringify(config.public), done);
		} else {
			console.error(e);
		}
	});
});

task('copy:bower_components', () => {
	return src('./bower_components/**/*')
		.pipe(dest('./built/resources/bower_components/'));
});

task('build:frontside-scripts', ['build:public-config'], done => {
	glob('./src/web/**/*.ls', (err: Error, files: string[]) => {
		const tasks = files.map(entry => {
			let bundle =
				browserify({
					entries: [entry],
					paths: [
						__dirname + '/built/_'
					]
				})
				.bundle()
				.pipe(source(entry.replace('src/web', 'resources').replace('.ls', '.js')));

			if (env === 'production') {
				bundle = bundle
					.pipe(buffer())
					.pipe(uglify());
			}

			return bundle
				.pipe(gulp.dest('./built'));
		});

		es.merge(tasks).on('end', done);
	});
});

task('build:frontside-styles', ['copy:bower_components'], () => {
	let styl = gulp.src('./src/web/**/*.styl')
		.pipe(stylus());

	if (env === 'production') {
		styl = styl
			.pipe(cssnano({
				safe: true // 高度な圧縮は無効にする (一部デザインが不適切になる場合があるため)
			}));
	}

	return styl
		.pipe(gulp.dest('./built/resources/'));
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

gulp.task('test', [
	'lint'
]);

gulp.task('lint', () =>
	gulp.src('./src/**/*.ts')
		.pipe(tslint({
			tslint: require('tslint')
		}))
		.pipe(tslint.report('verbose'))
);
