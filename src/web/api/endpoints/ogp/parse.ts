import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';

const jade: any = require('jade');

const client: any = require('cheerio-httpcli');
client.headers['User-Agent'] = 'MisskeyBot';
client.referer = false;
client.timeout = 10000;

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const url: string = req.query.url;

	// リクエスト送信
	client.fetch(url).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
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
				: getFullPath(url, iconPath)
			: getFullPath(url, shortcutIconPath);

		const compiler: (locals?: any) => string = jade.compileFile(
			`${__dirname}/viewer.jade`);

		// コンパイル
		const viewer: string = compiler({
			url,
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
		res.sendStatus(500);
	});
};

/**
 * 文字列が空かどうかを判定します。
 * @val: 文字列
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
 * @url: URL
 */
function removeUrlQuery(url: string): string {
	'use strict';

	return url.replace(/\?.*$/,'');
}

/**
 * 相対パスを任意のURLを元にして絶対パスに変換します。
 * @url: 元となるURL
 * @path: 元となる相対パス
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
