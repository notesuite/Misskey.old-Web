import * as express from 'express';

const client: any = require('cheerio-httpcli');
client.headers['User-Agent'] = 'MisskeyBot';
client.referer = false;
client.timeout = 10000;
client.maxDataSize = 1024 * 1024; // 1MiB

import config from './config';

export default function router(app: express.Express): void {
	'use strict';

	app.get(`/subdomain/${config.publicConfig.shieldDomain}/*`, (req, res) => {
		const url = req.path.replace(`/subdomain/${config.publicConfig.shieldDomain}/`, '');
		client.fetch(url).then((result: any) => {
			if (result.error !== undefined && result.error !== null) {
				return res.sendStatus(204);
			} else if (result.response.statusCode !== 200) {
				return res.sendStatus(204);
			}

			const contentType: string = result.response.headers['content-type'];

			if (contentType.indexOf('text/html') !== -1) {
				return res.sendStatus(204);
			}

			res.send(result.response.body);
		}, (err: any) => {
			res.sendStatus(204);
		});
	});
}
