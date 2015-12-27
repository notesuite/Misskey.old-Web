import { MisskeyExpressRequest } from '../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../misskey-express-response';
import requestApi from '../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	requestApi('posts/mentions', { 'limit': 10 }, req.user).then((mentions: any[]) => {
		res.display({
			mentions: mentions
		});
	});
};
