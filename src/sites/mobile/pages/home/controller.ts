import { User } from '../../../../models/user';
import { MisskeyExpressRequest } from '../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../misskey-express-response';
import requestApi from '../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const me: User = req.user;

	requestApi('posts/timeline', { 'limit': 10 }, me).then((tl: any[]) => {
		res.display({
			timeline: tl
		});
	});
};
