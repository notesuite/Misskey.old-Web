//////////////////////////////////////////////////
// MISSKEY-WEB BUILDER
//////////////////////////////////////////////////

'use strict';

Error.stackTraceLimit = Infinity;

const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const glob = require('glob');
const del = require('del');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const es = require('event-stream');
const replace = require('gulp-replace');
const stylus = require('gulp-stylus');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const ls = require('browserify-livescript');
const jadeify = require('jadeify');
const aliasify = require('aliasify');

const env = process.env.NODE_ENV;

const isProduction = env === 'production';

/*
 * Browserifyのモジュールエイリアス
 */
const aliasifyConfig = {
	"aliases": {
		"config": "./built/_/config.json",
		"jquery": "./bower_components/jquery/dist/jquery.js",
		"jquery.transit": "./bower_components/jquery.transit/jquery.transit.js",
		"cropper": "./bower_components/cropper/dist/cropper.js",
		"moment": "./bower_components/moment/moment.js",
		"Sortable": "./bower_components/Sortable/Sortable.js",
		"fastclick": "./bower_components/fastclick/lib/fastclick.js",
		"fuck-adblock": "./bower_components/fuck-adblock/fuckadblock.js",
		"Swiper": "./bower_components/Swiper/dist/js/swiper.js"
	},
	appliesTo: {
		"includeExtensions": ['.js', '.ls']
	}
};

const project = ts.createProject('tsconfig.json', {
	typescript: require('typescript')
});

const config = require('./built/config').default;

//////////////////////////////////////////////////
// Full build
gulp.task('build', [
	'lobby',
	'test',
	'build:ts',
	'copy:bower_components',
	'build:frontside-scripts',
	'build:frontside-styles',
	'build-copy'
], () => {
	gutil.log('ビルドが終了しました。');

	if (!isProduction) {
		gutil.log('■　注意！　開発モードでのビルドです。');
	}
});

//////////////////////////////////////////////////
// LOG INFO
gulp.task('lobby', () => {
	gutil.log('Misskey-Webのビルドを開始します。時間がかかる場合があります。');
	gutil.log('ENV: ' + env);
});

//////////////////////////////////////////////////
// TypeScriptのビルド
gulp.task('build:ts', () => {
	gutil.log('TypeScriptをコンパイルします...');

	return project
		.src()
		.pipe(ts(project))
		.pipe(gulp.dest('./built/'));
});

//////////////////////////////////////////////////
// configのデプロイ
gulp.task('build:public-config', ['build:ts'], done => {
	gutil.log('設定情報を配置します...');

	fs.mkdir('./built/_', e => {
		if (!e || (e && e.code === 'EEXIST')) {
			fs.writeFile('./built/_/config.json', JSON.stringify(config), done);
		} else {
			console.error(e);
		}
	});
});

//////////////////////////////////////////////////
// Bowerのパッケージのコピー
gulp.task('copy:bower_components', () => {
	gutil.log('Bower経由のパッケージを配置します...');

	return gulp.src('./bower_components/**/*')
		.pipe(gulp.dest('./built/resources/bower_components/'));
});

//////////////////////////////////////////////////
// フロントサイドのスクリプトのビルド
gulp.task('build:frontside-scripts', ['build:public-config'], done => {
	gutil.log('フロントサイドのスクリプトを構築します...');

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

			if (isProduction) {
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

//////////////////////////////////////////////////
// フロントサイドのスタイルのビルド
gulp.task('build:frontside-styles', ['copy:bower_components'], () => {
	gutil.log('フロントサイドのスタイルを構築します...');

	return gulp.src('./src/web/**/*.styl')
		.pipe(replace(/url\("#/g, 'url\("' + config.urls.resources))
		.pipe(stylus())
		.pipe(isProduction
			? cssnano({
				safe: true // 高度な圧縮は無効にする (一部デザインが不適切になる場合があるため)
			})
			: gutil.noop())
		.pipe(gulp.dest('./built/resources/'));
});

//////////////////////////////////////////////////
// その他のリソースのコピー
gulp.task('build-copy', [
	'build:ts',
	'build:frontside-scripts',
	'build:frontside-styles'
], () => {
	gutil.log('必要なリソースをコピーします...');

	return es.merge(
		gulp.src([
			'./src/web/**/*.styl',
			'./src/web/**/*.ts',
			'./src/web/**/*.jade'
		]).pipe(gulp.dest('./built/web/')),
		gulp.src('./src/resources/**/*').pipe(gulp.dest('./built/resources/')),
		gulp.src('./src/locales/**/*').pipe(gulp.dest('./built/locales/')),
		gulp.src([
			'./src/web/**/*',
			'!./src/web/**/*.js',
			'!./src/web/**/*.ts',
			'!./src/web/**/*.ls'
		]).pipe(gulp.dest('./built/resources/'))
	);
});

//////////////////////////////////////////////////
// テスト
gulp.task('test', [
	'lint'
]);

//////////////////////////////////////////////////
// Lint
gulp.task('lint', () => {
	gutil.log('構文の正当性を確認します...');

	return gulp.src('./src/**/*.ts')
		.pipe(tslint({
			tslint: require('tslint')
		}))
		.pipe(tslint.report('verbose'));
});

//////////////////////////////////////////////////
// CLEAN
gulp.task('clean', cb => {
	del([
		'./node_modules',
		'./typings',
		'./built',
		'./tmp'
	], cb);
});
