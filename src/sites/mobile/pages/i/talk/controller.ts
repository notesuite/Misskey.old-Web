import { MisskeyExpressRequest } from '../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../misskey-express-response';
import requestApi from '../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	// const me = req.me;
	const otherparty = req.data.user;

	requestApi('talks/stream', {
		'otherparty-id': otherparty.id
	}, req.me.id).then((messages: any[]) => {
		res.display({
			otherparty: otherparty,
			messages: messages.reverse()
		});
	});
};
