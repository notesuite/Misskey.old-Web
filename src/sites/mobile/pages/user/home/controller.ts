import { MisskeyExpressRequest } from '../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../misskey-express-response';
import requestApi from '../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	requestApi('posts/user-timeline', { 'limit': 10 }, req.me).then((timeline: any[]) => {
		res.display({
			user: req.data.user,
			timeline: timeline
		});
	});
};
