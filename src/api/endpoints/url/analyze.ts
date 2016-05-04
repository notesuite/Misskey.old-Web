import * as express from 'express';
import * as URL from 'url';
import * as request from 'request';
const jade: any = require('jade');

const client: any = require('cheerio-httpcli');
client.headers['User-Agent'] = 'MisskeyBot';
client.referer = false;
client.timeout = 10000;
client.maxDataSize = 1024 * 1024; // 1MiB

const Entities: any = require('html-entities').AllHtmlEntities;
const entities = new Entities();

import config from '../../../config';

/**
 * 指定されたURLのページのプレビューウィジェットを生成します。
 * @param req MisskeyExpressRequest
 * @param res MisskeyExpressResponse
 */
export default function (req: express.Request, res: express.Response): void {
	const urlStr: string = req.body.url;
	const url: URL.Url = URL.parse(urlStr, true);

	res.header('Content-Type', 'text/plain');

	switch (url.hostname) {
		case 'ja.wikipedia.org':
		case 'en.wikipedia.org':
			analyzeWikipedia(req, res, url);
			break;
		case 'ja.m.wikipedia.org':
		case 'en.m.wikipedia.org':
			analyzeMobileWikipedia(req, res, url);
			break;
		case 'www.youtube.com':
		case 'youtube.com':
		case 'youtu.be':
			analyzeYoutube(req, res, url);
			break;
		case 'soundcloud.com':
			analyzeSoundcloud(req, res, url);
			break;
		case 'gyazo.com':
			analyzeGyazo(req, res, url);
			break;
		case 'gist.github.com':
			analyzeGithubGist(req, res, url);
			break;
		default:
			analyzeGeneral(req, res, url);
			break;
	}
}

function analyzeWikipedia(req: express.Request, res: express.Response, url: URL.Url): void {
	'use strict';

	const title: string = decodeURI(url.pathname.split('/')[2]);

	client.fetch(url.href).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
			return res.sendStatus(500);
		}

		const $: any = result.$;

		const text: string = $('#mw-content-text > p:first-of-type').text();

		// Favicon
		const icon: string = URL.resolve(url.href, $('link[rel="shortcut icon"]').attr('href'));

		const compiler: (locals: any) => string = jade.compileFile(
			`${__dirname}/summary.jade`);

		const viewer = compiler({
			url: url,
			title,
			icon,
			description: text,
			image: 'https://ja.wikipedia.org/static/images/project-logos/enwiki.png',
			siteName: 'Wikipedia'
		});

		res.send(viewer);
	}, (err: any) => {
		res.sendStatus(204);
	});
}

function analyzeMobileWikipedia(req: express.Request, res: express.Response, url: URL.Url): void {
	'use strict';

	const title: string = decodeURI(url.pathname.split('/')[2]);

	client.fetch(url.href).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
			return res.sendStatus(500);
		}

		const $: any = result.$;

		const text: string = $('#bodyContent > div:first-of-type > p:first-of-type').text();

		// Favicon
		const icon: string = URL.resolve(url.href, $('link[rel="shortcut icon"]').attr('href'));

		const compiler: (locals: any) => string = jade.compileFile(
			`${__dirname}/summary.jade`);

		const viewer = compiler({
			url: url,
			title,
			icon,
			description: text,
			image: 'https://ja.wikipedia.org/static/images/project-logos/enwiki.png',
			siteName: 'Wikipedia'
		});

		res.send(viewer);
	}, (err: any) => {
		res.sendStatus(204);
	});
}

function analyzeYoutube(req: express.Request, res: express.Response, url: URL.Url): void {
	'use strict';

	function getVideoId(): string {
		'use strict';

		switch (url.hostname) {
			case 'www.youtube.com':
			case 'youtube.com':
				return url.query.v;
			case 'youtu.be':
				return url.pathname;
			default:
				return null;
		}
	}

	const videoId = getVideoId();

	const compiler: (locals: any) => string = jade.compileFile(
		`${__dirname}/youtube.jade`);

	const player: string = compiler({
		videoId
	});

	res.send(player);
}

function analyzeSoundcloud(req: express.Request, res: express.Response, url: URL.Url): void {
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
			return res.sendStatus(204);
		} else if (response.statusCode !== 200) {
			return res.sendStatus(204);
		} else {
			const parsed: any = JSON.parse(body);
			const html: string = parsed.html;
			const display = html.replace('height="400"', 'height="200"');
			res.send(display);
		}
	});
}

function analyzeGithubGist(req: express.Request, res: express.Response, url: URL.Url): void {
	'use strict';

	client.fetch(url.href).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
			return res.sendStatus(204);
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
				return res.sendStatus(204);
			} else if (getRawResponse.statusCode !== 200) {
				return res.sendStatus(204);
			} else {
				const compiler: (locals: any) => string = jade.compileFile(
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

function analyzeGyazo(req: express.Request, res: express.Response, url: URL.Url): void {
	'use strict';

	const imageId: string = url.pathname.substring(1);
	const src: string = `https://i.gyazo.com/${imageId}.png`;

	const compiler: (locals: any) => string = jade.compileFile(
		`${__dirname}/gyazo.jade`);

	const image: string = compiler({
		src,
		href: url.href
	});

	res.send(image);
}

/**
 * @param req MisskeyExpressRequest
 * @param res MisskeyExpressResponse
 * @param url url
 */
function analyzeGeneral(req: express.Request, res: express.Response, url: URL.Url): void {
	'use strict';

	// リクエスト送信
	client.fetch(url.href).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
			return res.sendStatus(204);
		}

		const contentType: string = result.response.headers['content-type'];

		// HTMLじゃなかった場合は中止
		if (contentType.indexOf('text/html') === -1) {
			return res.sendStatus(204);
		}

		const $: any = result.$;

		let title = or(
			$('meta[property="misskey:title"]').attr('content'),
			$('meta[property="og:title"]').attr('content'),
			$('meta[property="twitter:title"]').attr('content'),
			$('title').text());
		if (title === null) {
			return res.sendStatus(204);
		}
		title = clip(entities.decode(title), 100);

		const lang: string = $('html').attr('lang');

		const type = or(
			$('meta[property="misskey:type"]').attr('content'),
			$('meta[property="og:type"]').attr('content'));

		let image = or(
			$('meta[property="misskey:image"]').attr('content'),
			$('meta[property="og:image"]').attr('content'),
			$('meta[property="twitter:image"]').attr('content'),
			$('link[rel="image_src"]').attr('href'),
			$('link[rel="apple-touch-icon"]').attr('href'),
			$('link[rel="apple-touch-icon image_src"]').attr('href'));
		image = image !== null ? URL.resolve(url.href, image) : null;

		let description = or(
			$('meta[property="misskey:summary"]').attr('content'),
			$('meta[property="og:description"]').attr('content'),
			$('meta[property="twitter:description"]').attr('content'),
			$('meta[name="description"]').attr('content'));
		description = description !== null
			? clip(entities.decode(description), 300)
			: null;

		if (title === description) {
			description = null;
		}

		let siteName = or(
			$('meta[property="misskey:site-name"]').attr('content'),
			$('meta[property="og:site_name"]').attr('content'),
			$('meta[name="application-name"]').attr('content'));
		siteName = siteName !== null ? entities.decode(siteName) : null;

		let icon = or(
			$('meta[property="misskey:site-icon"]').attr('content'),
			$('link[rel="shortcut icon"]').attr('href'),
			$('link[rel="icon"]').attr('href'),
			'/favicon.ico');
		icon = icon !== null ? URL.resolve(url.href, icon) : null;

		const compiler: (locals: any) => string = jade.compileFile(
			`${__dirname}/summary.jade`);

		// コンパイル
		const viewer: string = compiler({
			url: url,
			title: title,
			icon: icon,
			lang: lang,
			description: description,
			type: type,
			image: image,
			siteName: siteName
		});

		res.send(viewer);
	}, (err: any) => {
		res.sendStatus(204);
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

function or(...xs: string[]): string {
	'use strict';

	for (let i = 0; i < xs.length; i++) {
		const x = xs[i];
		if (!nullOrEmpty(x)) {
			return x;
		}
	}

	return null;
}

function clip(s: string, max: number): string {
	'use strict';

	if (nullOrEmpty(s)) {
		return s;
	}

	s = s.trim();

	if (s.length > max) {
		return s.substr(0, max) + '...';
	} else {
		return s;
	}
}
