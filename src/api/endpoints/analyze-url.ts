import * as URL from 'url';

import * as request from 'request';
const jade: any = require('jade');

const client: any = require('cheerio-httpcli');
client.headers['User-Agent'] = 'MisskeyBot';
client.referer = false;
client.timeout = 10000;
client.maxDataSize = 1024 * 1024; // 1MiB

import { MisskeyExpressRequest } from '../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../misskeyExpressResponse';

/**
 * 指定されたURLのページのプレビューウィジェットを生成します。
 * @param req MisskeyExpressRequest
 * @param res MisskeyExpressResponse
 */
export default function analyze(req: MisskeyExpressRequest, res: MisskeyExpressResponse): void {
	'use strict';

	const urlStr: string = req.query.url;
	const url: URL.Url = URL.parse(urlStr, true);

	res.set({
		'Content-Type': 'text/plain'
	});

	switch (url.hostname) {
		case 'ja.wikipedia.org':
		case 'en.wikipedia.org':
			analyzeWikipedia(req, res, url);
			break;
		case 'www.youtube.com':
		case 'youtu.be':
			analyzeYoutube(req, res, url);
			break;
		case 'soundcloud.com':
			analyzeSoundcloud(req, res, url);
			break;
		case 'gist.github.com':
			analyzeGithubGist(req, res, url);
			break;
		default:
			analyzeGeneral(req, res, url);
			break;
	}
}

function analyzeWikipedia(req: MisskeyExpressRequest, res: MisskeyExpressResponse, url: URL.Url): void {
	'use strict';

	const title: string = decodeURI(url.pathname.split('/')[2]);

	client.fetch(url.href).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
			console.error(result.error);
			return res.sendStatus(500);
		}

		const $: any = result.$;

		const text: string = $('#mw-content-text > p:first-child').text();

		// Favicon
		const icon: string = getFullPath(url.href, $('link[rel="shortcut icon"]').attr('href'));

		const compiler: (locals?: any) => string = jade.compileFile(
			`${__dirname}/summary.jade`);

		const viewer = compiler({
			url: url.href,
			title,
			icon,
			description: text,
			image: 'https://ja.wikipedia.org/static/images/project-logos/enwiki.png',
			siteName: 'Wikipedia'
		});

		res.send(viewer);
	}, (err: any) => {
		console.error(err);
		res.sendStatus(500);
	});
}

function analyzeYoutube(req: MisskeyExpressRequest, res: MisskeyExpressResponse, url: URL.Url): void {
	'use strict';

	function getVideoId(): string {
		'use strict';

		switch (url.hostname) {
			case 'www.youtube.com':
				return url.query.v;
			case 'youtu.be':
				return url.pathname;
			default:
				return null;
		}
	}

	const videoId = getVideoId();

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/youtube.jade`);

	const player: string = compiler({
		videoId
	});

	res.send(player);
}

function analyzeSoundcloud(req: MisskeyExpressRequest, res: MisskeyExpressResponse, url: URL.Url): void {
	'use strict';

	request({
		url: 'http://soundcloud.com/oembed',
		method: 'get',
		qs: {
			format: 'json',
			url: url.href
		}
	}, (err, response, body) => {
		if (err !== null) {
			return res.sendStatus(500);
		} else if (response.statusCode !== 200) {
			return res.sendStatus(500);
		} else {
			const parsed: any = JSON.parse(body);
			const html: string = parsed.html;
			const display = html.replace('height="400"', 'height="200"');
			res.send(display);
		}
	});
}

function analyzeGithubGist(req: MisskeyExpressRequest, res: MisskeyExpressResponse, url: URL.Url): void {
	'use strict';

	client.fetch(url.href).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
			console.error(result.error);
			return res.sendStatus(500);
		}

		const $: any = result.$;

		const avatarUrl: string = $('meta[property="og:image"]').attr('content');
		const userName: string = $('meta[name="octolytics-dimension-owner_login"]').attr('content');
		const fileName: string = $('.gist-header-title > a').text();
		const description: string = $('meta[property="og:description"]').attr('content');
		const $rawButton = $('#gist-pjax-container .js-gist-file-update-container > .file > .file-header > .file-actions > .btn');
		const resolvedRawUrl = URL.resolve('https://gist.githubusercontent.com', $rawButton.attr('href'));

		request(resolvedRawUrl, (getRawErr: any, getRawResponse: any, raw: any) => {
			if (getRawErr !== null) {
				return res.sendStatus(500);
			} else if (getRawResponse.statusCode !== 200) {
				return res.sendStatus(500);
			} else {
				const compiler: (locals?: any) => string = jade.compileFile(
					`${__dirname}/gist.jade`);

				const viewer: string = compiler({
					url: url.href,
					avatarUrl,
					userName,
					fileName,
					description,
					raw
				});

				res.send(viewer);
			}
		});
	});
}

/**
 * @param req MisskeyExpressRequest
 * @param res MisskeyExpressResponse
 * @param url url
 */
function analyzeGeneral(req: MisskeyExpressRequest, res: MisskeyExpressResponse, url: URL.Url): void {
	'use strict';

	// リクエスト送信
	client.fetch(url.href).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
			console.error(result.error);
			return res.sendStatus(500);
		}

		const contentType: string = result.response.headers['content-type'];

		// HTMLじゃなかった場合は中止
		if (contentType.indexOf('text/html') === -1) {
			return res.sendStatus(500);
		}

		const $: any = result.$;

		const getOGPdata = (name: string): string => $(`meta[property="og:${name}"]`).attr('content');

		// 各種OGP情報
		const ogTitle = getOGPdata('title');
		const ogType = getOGPdata('type');
		const ogImage = getOGPdata('image');
		const ogDescription = getOGPdata('description');
		const ogSiteName = getOGPdata('site_name');

		// OGPで失敗したらtitleから拝借
		const title: string = nullOrEmpty(ogTitle)
			? $('title').text()
			: ogTitle;

		if (nullOrEmpty(title)) {
			return res.sendStatus(500);
		}

		// OGPで失敗したらmetaタグのdescriptionから拝借
		const description: string = nullOrEmpty(ogDescription)
			? $('meta[name="description"]').attr('content')
			: ogDescription;

		// Language
		const lang: string = $('html').attr('lang');

		// Favicon
		const shortcutIconPath: string = $('link[rel="shortcut icon"]').attr('href');
		const iconPath: string = $('link[rel="icon"]').attr('href');
		const icon: string = nullOrEmpty(shortcutIconPath)
			? nullOrEmpty(iconPath)
				? null
				: getFullPath(url.href, iconPath)
			: getFullPath(url.href, shortcutIconPath);

		const compiler: (locals?: any) => string = jade.compileFile(
			`${__dirname}/summary.jade`);

		// コンパイル
		const viewer: string = compiler({
			url: url.href,
			title,
			icon,
			lang,
			description,
			type: ogType,
			image: ogImage,
			siteName: ogSiteName
		});

		res.send(viewer);
	}, (err: any) => {
		console.error(err);
		res.sendStatus(500);
	});
}

/**
 * 文字列が空かどうかを判定します。
 * @param val: 文字列
 */
function nullOrEmpty(val: string): boolean {
	'use strict';

	if (val === undefined) {
		return true;
	} else if (val === null) {
		return true;
	} else if (val.trim() === '') {
		return true;
	} else {
		return false;
	}
}

/**
 * URLに含まれる末尾のクエリを除去します。
 * @param url: URL
 */
function removeUrlQuery(url: string): string {
	'use strict';

	return url.replace(/\?.*$/, '');
}

/**
 * 相対パスを任意のURLを元にして絶対パスに変換します。
 * @param url: 元となるURL
 * @param path: 元となる相対パス
 */
function getFullPath(url: string, path: string): string {
	'use strict';

	url = url.trim();
	path = path.trim();

	const schema: string = url.substring(0, url.indexOf(':'));
	const host: string = url.substring(0, url.indexOf('/', schema.length + 3));

	if (path.indexOf('http') === 0) {
		return path;
	}

	if (path.indexOf('/') === 0) {
		return host + path;
	}

	return removeUrlQuery(url) + path;
}
