import * as express from 'express';
import requestApi from '../../../utils/request-api';

export default function reply(req: express.Request, res: express.Response): void {
	'use strict';

	const photos: string = req.body['photos'];

	if (photos !== undefined && photos !== null && photos !== '[]') {
		requestApi('posts/create', {
			type: 'photo',
			'in-reply-to-post-id': req.body['in-reply-to-post-id'],
			photos: req.body['photos'],
			text: req.body['text']
		}, req.user).then((reply: Object) => {
			res.send(reply);
		}, (err: any) => {
			res.send(err);
		});
	} else {
		requestApi('posts/create', {
			type: 'text',
			'in-reply-to-post-id': req.body['in-reply-to-post-id'],
			text: req.body['text']
		}, req.user).then((reply: Object) => {
			res.send(reply);
		}, (err: any) => {
			res.send(err);
		});
	}
};
