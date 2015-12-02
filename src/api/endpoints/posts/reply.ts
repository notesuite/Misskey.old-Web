import * as express from 'express';
import requestApi from '../../../utils/request-api';

export default function reply(req: express.Request, res: express.Response): void {
	'use strict';

	const photos: string = req.body['photos'];

	if (photos !== undefined && photos !== null && photos !== '[]') {
		requestApi('posts/photo', req.body, req.user).then((reply: Object) => {
			res.send(reply);
		}, (err: any) => {
			res.send(err);
		});
	} else {
		requestApi('posts/status', req.body, req.user).then((reply: Object) => {
			res.send(reply);
		}, (err: any) => {
			res.send(err);
		});
	}
};
