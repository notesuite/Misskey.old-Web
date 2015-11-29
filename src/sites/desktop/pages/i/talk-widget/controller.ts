import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';
import requestApi from '../../../../../utils/requestApi';
import parsePostText from '../../../../../utils/parsePostText';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	// const me = req.me;
	const otherparty = req.data.user;

	requestApi('GET', 'talks/stream', {
		'otherparty-id': otherparty.id
	}, req.me.id).then((messages: any[]) => {
		console.log(messages);
		res.display({
			messages: messages,
			parsePostText: parsePostText
		});
	});
};
