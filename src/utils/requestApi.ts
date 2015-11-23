import * as http from 'http';
import * as request from 'request';

import config from '../config';

export default function(method: string, endpoint: string, params: any, userId?: string): Promise<any> {
	'use strict';
	return new Promise<any>((resolve, reject) => {
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
			if (err !== null) {
				reject(err);
			} else if (response.statusCode !== 200) {
				reject({
					statusCode: response.statusCode,
					body: JSON.parse(body).error
				});
			} else if (body === undefined) {
				reject('something-happened');
			} else {
				try {
					const parsed: any = JSON.parse(body);
					resolve(parsed);
				} catch (e) {
					reject(e);
				}
			}
		});
	});
}
