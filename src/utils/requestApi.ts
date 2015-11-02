import * as http from 'http';
import * as request from 'request';

import config from '../config';

export default function(method: string, endpoint: string, params: any, userId?: string): Promise<any> {
	'use strict';
	return new Promise((resolve: (value: any) => void, reject: (err: any) => void) => {
		const options: request.Options = {
			url: `http://${config.apiServerIp}:${config.apiServerPort}/${endpoint}`,
			method: method,
			formData: method !== 'GET' ? params : null,
			qs: method === 'GET' ? params : null,
			headers: {
				'passkey': config.apiPasskey,
				'user-id': userId
			}
		};
		request(options, (err: any, response: http.IncomingMessage, body: any) => {
			if (err) {
				reject(err);
			} else {
				// console.log(body);
				resolve(JSON.parse(body));
			}
		});
	});
}
