import * as fs from 'fs';
const jade: any = require('jade');

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
	requestApi('POST', 'album/files/upload', data, req.session.userId).then((albumFile: Object) => {
		const compiler: (locals?: any) => string = jade.compileFile(
			`${__dirname}/../../../../sites/desktop/views/lib/album/file.jade`);
		res.send(compiler({
			file: albumFile
		}));
	});
};
