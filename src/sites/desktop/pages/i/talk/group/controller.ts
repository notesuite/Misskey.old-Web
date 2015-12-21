import { MisskeyExpressRequest } from '../../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../../misskey-express-response';
import requestApi from '../../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const group = req.data.talkGroup;

	requestApi('talks/messages/stream', {
		'group-id': group.id
	}, req.me.id).then((messages: any[]) => {
		console.log(messages);
		res.display({
			group: group,
			messages: messages.reverse()
		});
	});
};
