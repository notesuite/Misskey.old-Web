import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
import requestApi from '../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	requestApi('GET', 'talks/history', {}, req.me.id).then((messages: any[]) => {
		console.log(messages);
		res.display(req, 'i/talks-widget', {
			messages: messages
		});
	});
};
