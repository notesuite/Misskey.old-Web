'use strict';

Error.stackTraceLimit = Infinity;

const fs = require('fs');
const gulp = require('gulp');
const glob = require('glob');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const es = require('event-stream');
const stylus = require('gulp-stylus');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const ls = require('browserify-livescript');
const jadeify = require('jadeify');
const aliasify = require('aliasify');

const env = process.env.NODE_ENV;

const aliasifyConfig = {
	"aliases": {
		"config": "./built/_/config.json",
		"jquery": "./bower_components/jquery/dist/jquery.js"
	}
};

gulp.task('build', [
	'build:ts',
	'copy:bower_components',
	'build:frontside-scripts',
	'build:frontside-styles',
	'build-copy'
]);

const project = ts.createProject('tsconfig.json', {
	typescript: require('typescript')
});

gulp.task('build:ts', () =>
	project
	.src()
	.pipe(ts(project))
	.pipe(gulp.dest('./built/'))
);

gulp.task('build:public-config', ['build:ts'], done => {
	const config = require('./built/config').default;
	fs.mkdir('./built/_', e => {
		if (!e || (e && e.code === 'EEXIST')) {
			fs.writeFile('./built/_/config.json', JSON.stringify(config.public), done);
		} else {
			console.error(e);
		}
	});
});

gulp.task('copy:bower_components', () => {
	return gulp.src('./bower_components/**/*')
		.pipe(gulp.dest('./built/resources/bower_components/'));
});

gulp.task('build:frontside-scripts', ['build:public-config'], done => {
	glob('./src/web/**/*.ls', (err, files) => {
		const tasks = files.map(entry => {
			let bundle =
				browserify({
					entries: [entry]
				})
				.transform(ls)
				.transform(aliasify, aliasifyConfig)
				.transform(jadeify, {
					"compileDebug": false,
					"pretty": false
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

gulp.task('build:frontside-styles', ['copy:bower_components'], () => {
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

gulp.task('build-copy', ['build:ts', 'build:frontside-scripts', 'build:frontside-styles'], () => {
	return es.merge(
		gulp.src([
			'./src/web/**/*.styl',
			'./src/web/**/*.ts',
			'./src/web/**/*.jade'
		]).pipe(gulp.dest('./built/web/')),
		gulp.src('./src/resources/**/*').pipe(gulp.dest('./built/resources/')),
		gulp.src([
			'./src/web/**/*',
			'!./src/web/**/*.js',
			'!./src/web/**/*.ts',
			'!./src/web/**/*.ls'
		]).pipe(gulp.dest('./built/resources/'))
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
