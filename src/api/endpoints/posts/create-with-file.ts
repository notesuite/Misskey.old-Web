import * as fs from 'fs';
import * as express from 'express';
import requestApi from '../../../utils/request-api';

export default function createWithFile(req: express.Request, res: express.Response): void {
	'use strict';

	const file: Express.Multer.File = (<any>req).file;
	if (file !== undefined && file !== null) {
		const data: any = {};
		data.file = {
			value: fs.readFileSync(file.path),
			options: {
				filename: file.originalname,
				contentType: file.mimetype
			}
		};
		fs.unlink(file.path);
		requestApi('album/files/upload', data, req.user, true).then((albumFile: Object) => {
			create(albumFile);
		}, (err: any) => {
			console.error(err);
			res.status(500).send(err);
		});
	} else {
		create();
	}

	function create(photo: any = null): void {
		if (photo !== null) {
			requestApi('posts/create', {
				'type': 'photo',
				'text': req.body.text,
				'photos': JSON.stringify([photo.id]),
				'in-reply-to-post-id': req.body['in-reply-to-post-id']
			}, req.user).then((post: Object) => {
				res.send(post);
			}, (err: any) => {
				res.status(500).send(err);
			});
		} else {
			requestApi('posts/create', {
				'type': 'text',
				'text': req.body.text,
				'in-reply-to-post-id': req.body['in-reply-to-post-id']
			}, req.user).then((post: Object) => {
				res.send(post);
			}, (err: any) => {
				res.status(500).send(err);
			});
		}
	}
};
