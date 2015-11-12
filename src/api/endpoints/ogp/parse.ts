import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';

const jade: any = require('jade');

const client: any = require('cheerio-httpcli');
client.headers['User-Agent'] = 'MisskeyBot(OGP)';
client.referer = false;

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const url: string = req.query.url;

	// リクエスト送信
	client.fetch(url).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
			return res.sendStatus(500);
		}

		const $: any = result.$;

		const getOGPdata = (name: string) => $(`meta[property="og:${name}"]`).attr('content');

		// 各種OGP情報
		const ogTitle = getOGPdata('title');
		const ogType = getOGPdata('type');
		const ogImage = getOGPdata('image');
		const ogDescription = getOGPdata('description');
		console.log(ogTitle);

		const compiler: (locals?: any) => string = jade.compileFile(
			`${__dirname}/viewer.jade`);

		// コンパイル
		const viewer: string = compiler({
			url: url,
			title: ogTitle,
			type: ogType,
			image: ogImage,
			description: ogDescription
		});

		res.send(viewer);
	}, (err: any) => {
		res.sendStatus(500);
	});
};
