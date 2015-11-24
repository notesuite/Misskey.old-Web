import * as http from 'http';
import * as request from 'request';

import config from '../config';

export default function requestApi(
		method: string,
		endpoint: string,
		params: any,
		user: any = null,
		isFile: boolean = false): Promise<any> {
	'use strict';
	const userId: string = user !== null ? typeof user === 'string' ? user : user.id : null;
	return new Promise<any>((resolve, reject) => {
		const options: request.Options = {
			url: `http://${config.apiServerIp}:${config.apiServerPort}/${endpoint}`,
			method: method,
			headers: {
				'passkey': config.apiPasskey,
				'user-id': userId
			}
		};
		switch (method) {
			case 'GET':
				options.qs = params;
				break;
			default:
				if (isFile) {
					options.formData = params;
				} else {
					options.form = params;
				}
				break;
		}
		try {
			request(options, (err: any, response: http.IncomingMessage, body: any) => {
				if (err !== null) {
					console.log('uwaaaaaaaaaaaaaaaaaaaa');
					reject(err);
				} else if (response.statusCode !== 200) {
					reject({
						statusCode: response.statusCode,
						body: JSON.parse(body).error
					});
				} else if (body === undefined) {
					reject('something-happened');
				} else {
					const parsed: any = JSON.parse(body);
					resolve(parsed);
				}
			});
		} catch (e) {
			console.log('hm');
			console.error(e);
			reject(e);
		}
	});
}
