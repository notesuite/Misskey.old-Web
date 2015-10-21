import * as http from 'http';
import * as request from 'request';

import config from '../config';

export default function(method: string, endpoint: string, params: any, userId?: string): Promise<any> {
	'use strict';
	return new Promise((resolve: (value: any) => void, reject: (err: any) => void) => {
		// 送信する
		request({
			url: `http://${config.apiServerIp}:${config.apiServerPort}/register`,
			method: method,
			formData: params,
			headers: {
				'passkey': config.apiPasskey,
				'user-id': userId
			}
		}, (err: any, response: http.IncomingMessage) => {
			if (err) {
				reject(err);
			} else {
				console.log(response);
				resolve(response);
			}
		});
	});
}
