import { MisskeyExpressRequest } from '../../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../../misskey-express-response';
import requestApi from '../../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	requestApi('talks/history/show', {
		type: 'user'
	}, req.me.id).then((messages: any[]) => {
		res.display({
			messages: messages
		});
	});
};
