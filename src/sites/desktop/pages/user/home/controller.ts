import { User } from '../../../../../models/user';
import { Post } from '../../../../../models/post';
import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';
import parsePostText from '../../../../../utils/parsePostText';
import requestApi from '../../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.data.user;
	const me: User = req.me;

	requestApi('GET', 'posts/user-timeline', {
		'user-id': user.id
	}, me !== null ? me.id : null).then((tl: Post[]) => {
		res.display({
			user: user,
			isMe: req.isLogin && user.id.toString() === me.id.toString(),
			timeline: tl,
			parsePostText: parsePostText
		});
	});
};
