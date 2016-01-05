import { MisskeyExpressRequest } from '../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../misskey-express-response';
import requestApi from '../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	requestApi('notifications/timeline', {
		'limit': 30
	}, req.user).then((notifications: any[]) => {
		res.display({
			notifications: notifications
		});
	});
};
