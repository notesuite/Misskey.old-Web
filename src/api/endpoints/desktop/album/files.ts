import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
import requestApi from '../../../../utils/requestApi';
import mapToHtml from '../../../../utils/mapToHtml';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	requestApi('GET', 'album/files/list', req.query, req.session.userId).then((files: Object[]) => {
		res.send(mapToHtml(`${__dirname}/../../../../sites/desktop/views/lib/album/file.jade`, 'file', files));
	});
};
