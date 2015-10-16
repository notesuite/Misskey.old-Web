import * as http from 'http';
import * as request from 'request';

const config: any = require('../config');

export default function(method: string, endpoint: string, params: any): Promise<any> {
	'use strict';
	return new Promise((resolve: (value: any) => void, reject: (err: any) => void) => {
		// 送信する
		request({
			url: `http://${config.apiServerIp}:${config.apiServerPort}/register`,
			method: method,
			formData: params
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
