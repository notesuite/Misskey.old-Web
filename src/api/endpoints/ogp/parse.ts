import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';

const client: any = require('cheerio-httpcli');
client.headers['User-Agent'] = 'MisskeyBot(OGP)';
client.referer = false;

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	client.fetch(req.query.url).then((result: any) => {
		if (result.error !== undefined && result.error !== null) {
			return res.sendStatus(500);
		}
		const $: any = result.$;
		const getOGPdata = (name: string) => $(`meta[property="og:${name}"]`).attr('content');
		const ogTitle = getOGPdata('title');
		const ogType = getOGPdata('type');
		const ogImage = getOGPdata('image');
		
	}, (err: any) => {
		res.sendStatus(500);
	});
};
