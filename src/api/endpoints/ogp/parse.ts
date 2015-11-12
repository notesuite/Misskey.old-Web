import * as http from 'http';
import * as request from 'request';
import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	const options: request.Options = {
		url: req.query.url,
		method: 'GET',
		headers: {
			'User-Agent': 'MisskeyBot(OGP)'
		}
	};
	request(options, (err: any, response: http.IncomingMessage, body: any) => {
		if (err !== null) {
			res.sendStatus(500);
		} else if (response.statusCode !== 200) {
			console.log(body);
		} else {
			res.sendStatus(500);
		}
	});
};
