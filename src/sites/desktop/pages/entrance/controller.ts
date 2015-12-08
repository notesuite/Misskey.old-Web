import { MisskeyExpressRequest } from '../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../misskey-express-response';
import requestApi from '../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	requestApi('hashtags/trend/show', {}).then((hashtags: string[]) => {
		res.display({
			trends: hashtags
		});
	});
};
