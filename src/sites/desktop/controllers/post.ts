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
	const post: any = req.data.post;
	const me: User = req.me;

	requestApi('GET', 'posts/replies', {
		'post-id': post.id
	}, me !== null ? me.id : null).then((replies: Post[]) => {
		res.display(req, 'post', {
			user: user,
			me: me,
			post: post,
			likes: null,
			reposts: null,
			replies: replies,
			parsePostText: parsePostText
		});
	});
};
