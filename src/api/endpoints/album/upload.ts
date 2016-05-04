import * as fs from 'fs';
import * as express from 'express';

import requestApi from '../../../core/request-api';

export default function (req: express.Request, res: express.Response): void {
	const file: Express.Multer.File = (<any>req).file;
	const folder: string = req.body.folder;
	const data: any = {};
	data.file = {
		value: fs.readFileSync(file.path),
		options: {
			filename: file.originalname,
			contentType: file.mimetype
		}
	};
	if (folder !== undefined && folder !== null) {
		data['folder-id'] = folder;
	}
	fs.unlink(file.path);
	requestApi('album/files/upload', data, req.user, true).then((albumFile: Object) => {
		res.send(albumFile);
	}, (err: any) => {
		console.error(err);
		res.status(500).send('something-happened');
	});
};
