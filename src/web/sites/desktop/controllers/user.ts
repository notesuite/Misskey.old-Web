import { User } from '../../../../models/user';
import { Post } from '../../../../models/post';
import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
// import generateHomeTimelineHtml from '../utils/generateHomeTimelineHtml';
import parsePostText from '../../../../utils/parsePostText';
import requestApi from '../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.user;
	const me: User = req.me;

	res.display(req, 'user', {
		user: user
	});
};
