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
			res.status(500).send('something-happened');
		});
	} else {
		create();
	}

	function create(photo: any = null): void {
		if (photo !== null) {
			requestApi('posts/photo', {
				text: req.body.text,
				photos: [photo.id]
			}, req.user).then((reply: Object) => {
				res.send(reply);
			}, (err: any) => {
				res.send(err);
			});
		} else {
			requestApi('posts/status', {
				text: req.body.text
			}, req.user).then((reply: Object) => {
				res.send(reply);
			}, (err: any) => {
				res.send(err);
			});
		}
	}
};
