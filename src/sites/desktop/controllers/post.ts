import { User } from '../../../models/user';
import { Post } from '../../../models/post';
import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';
// import generateHomeTimelineHtml from '../utils/generateHomeTimelineHtml';
import parsePostText from '../../../utils/parsePostText';
import requestApi from '../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.parameds.user;
	const post: Post = req.parameds.post;
	const me: User = req.me;

	res.display(req, 'post', {
		user: user,
		me: me,
		post: post,
		parsePostText: parsePostText
	});
};
