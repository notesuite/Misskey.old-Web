import { User } from '../../../../../models/user';
import { MisskeyExpressRequest } from '../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../misskey-express-response';
import requestApi from '../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.data.user;
	const me: User = req.user;

	requestApi('users/following', {
		'user-id': user.id
	}, me).then(following => {
		res.display({
			user: user,
			following: following
		});
	});
};
