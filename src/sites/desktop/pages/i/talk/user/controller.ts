import { MisskeyExpressRequest } from '../../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../../misskey-express-response';
import requestApi from '../../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	// const me = req.me;
	const otherparty = req.data.user;

	requestApi('talks/messages/stream', {
		'user-id': otherparty.id
	}, req.me.id).then((messages: any[]) => {
		console.log(messages);
		res.display({
			otherparty: otherparty,
			messages: messages.reverse()
		});
	});
};
