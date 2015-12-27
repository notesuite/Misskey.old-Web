import { MisskeyExpressRequest } from '../../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../../misskey-express-response';
import requestApi from '../../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	requestApi('talks/history/show', {
		type: 'group'
	}, req.user.id).then((messages: any[]) => {
		requestApi('talks/group/invitations/show', {}, req.user.id).then((invitations: any[]) => {
			res.display({
				messages: messages,
				invitations: invitations
			});
		});
	});
};
