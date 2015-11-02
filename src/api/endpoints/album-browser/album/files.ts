import * as fs from 'fs';
import * as express from 'express';
import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
import requestApi from '../../../../utils/requestApi';
import mapToHtml from '../../../../utils/mapToHtml';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	requestApi("GET", 'album/files', req.query, req.session.userId).then((files: Object[]) => {
		res.send(mapToHtml(`${__dirname}/../web/sites/desktop/views/dynamic-parts/album/file.jade`, 'file', files));
	});
};
