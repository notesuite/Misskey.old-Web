import * as fs from 'fs';
import * as express from 'express';
const jade: any = require('jade');

import requestApi from '../../../../../utils/requestApi';

export default function upload(req: express.Request, res: express.Response): void {
	'use strict';
	const file: Express.Multer.File = (<any>req).file;
	const data: any = {};
	data.file = {
		value: fs.readFileSync(file.path),
		options: {
			filename: file.originalname,
			contentType: file.mimetype
		}
	};
	fs.unlink(file.path);
	requestApi('POST', 'album/files/upload', data, req.user, true).then((albumFile: Object) => {
		const compiler: (locals?: any) => string = jade.compileFile(
			`${__dirname}/../../../../../sites/desktop/views/lib/album/file.jade`);
		res.send(compiler({
			file: albumFile
		}));
	}, (err: any) => {
		console.error(err);
		res.status(500).send('something-happened');
	});
};
