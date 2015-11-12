import * as fs from 'fs';
import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';
import requestApi from '../../../../../utils/requestApi';

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
	requestApi('POST', 'album/files/upload', data, req.session.userId).then((file: Object) => {
		res.json(file);
	});
};
