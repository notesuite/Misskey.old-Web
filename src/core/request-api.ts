import * as http from 'http';
import * as request from 'request';

import config from '../config';

export default function requestApi(
	endpoint: string,
	params: any,
	user: any = null,
	withFile: boolean = false
): Promise<any> {
	const userId: string = user !== null ? typeof user === 'string' ? user : user.id : null;

	return new Promise<any>((resolve, reject) => {
		const options: request.Options = {
			url: `http://${config.api.host}:${config.api.port}/${endpoint}`,
			method: 'POST',
			headers: {
				'passkey': config.api.pass,
				'user-id': userId
			}
		};
		if (withFile) {
			options.formData = params;
		} else {
			options.form = params;
		}
		try {
			request(options, (err: any, response: http.IncomingMessage, body: any) => {
				if (err !== null) {
					console.error(err);
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
			console.error('omg');
			console.error(e);
			reject(e);
		}
	});
}
