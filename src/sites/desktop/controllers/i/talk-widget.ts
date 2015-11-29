import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
import requestApi from '../../../../utils/requestApi';
import parsePostText from '../../../../utils/parsePostText';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	// const me = req.me;
	const otherparty = req.user;

	requestApi('GET', 'talks/stream', {
		'otherparty-id': otherparty.id
	}, req.me.id).then((messages: any[]) => {
		console.log(messages);
		res.display(req, 'i/talk-widget', {
			messages: messages,
			parsePostText: parsePostText
		});
	});
};
