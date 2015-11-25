import * as express from 'express';
import requestApi from '../../../../../utils/requestApi';
import mapToHtml from '../../../../../utils/mapToHtml';

export default function file(req: express.Request, res: express.Response): void {
	'use strict';
	requestApi('GET', 'album/files/list', req.query, req.user).then((files: Object[]) => {
		res.send(mapToHtml(`${__dirname}/../../../../../sites/desktop/views/lib/album/file.jade`, 'file', files));
	});
};
