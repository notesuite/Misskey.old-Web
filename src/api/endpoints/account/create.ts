import * as http from 'http';
import * as express from 'express';
import * as request from 'request';
import requestApi from '../../../core/request-api';
import config from '../../../config';

export default function (req: express.Request, res: express.Response): void {
	request({
		url: 'https://www.google.com/recaptcha/api/siteverify',
		method: 'POST',
		form: {
			'secret': config.recaptcha.secretKey,
			'response': req.body['g-recaptcha-response']
		}
	}, (err: any, response: http.IncomingMessage, body: any) => {
		if (err !== null) {
			console.error(err);
			res.sendStatus(500);
			return;
		}
		const parsed: any = JSON.parse(body);
		if (parsed.success) {
			requestApi('account/create', {
				'screen-name': req.body['screen-name'],
				'password': req.body['password']
			}).then((account: Object) => {
				res.send(account);
			}, (err2: any) => {
				res.send(err2);
			});
		} else {
			res.status(400).send('recaptcha-failed');
		}
	});
};
