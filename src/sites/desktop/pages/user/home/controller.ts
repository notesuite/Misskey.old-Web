import { User } from '../../../models/user';
import { Post } from '../../../models/post';
import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';
// import generateHomeTimelineHtml from '../utils/generateHomeTimelineHtml';
import parsePostText from '../../../utils/parsePostText';
import requestApi from '../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.data.user;
	const me: User = req.me;

	requestApi('GET', 'posts/user-timeline', {
		'user-id': user.id
	}, me !== null ? me.id : null).then((tl: Post[]) => {
		res.display(req, 'user', {
			user: user,
			me: me,
			isMe: req.isLogin && user.id.toString() === me.id.toString(),
			timeline: tl,
			parsePostText: parsePostText
		});
	});
};
