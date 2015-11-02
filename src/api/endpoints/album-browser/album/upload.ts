import * as fs from 'fs';
import * as express from 'express';
import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
import requestApi from '../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	const file: Express.Multer.File = req.files['file'];
	const data: any = req.body;
	data.file = {
		value: fs.readFileSync(file.path),
		options: {
			filename: file.originalname,
			contentType: file.mimetype
		}
	};
	requestApi('POST', req.path.substring(1), data, req.session.userId).then((files: Object[]) => {
		res.sendStatus(200);
	});
};
