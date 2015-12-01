import * as express from 'express';
import requestApi from '../../../../../utils/request-api';
import mapToHtml from '../../../../../utils/map-to-html';

export default function file(req: express.Request, res: express.Response): void {
	'use strict';
	requestApi('album/files/list', req.query, req.user).then((files: Object[]) => {
		res.send(mapToHtml(
			`${__dirname}/../../../../../sites/desktop/common/views/album/file.jade`,
			'file', files));
	});
};
