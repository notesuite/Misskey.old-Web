import { User } from '../../../models/user';
import { Post } from '../../../models/post';
import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';
// import generateHomeTimelineHtml from '../utils/generateHomeTimelineHtml';
import parsePostText from '../../../utils/parsePostText';
import requestApi from '../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.user;
	const me: User = req.me;

	requestApi('GET', 'posts/user-timeline', {
		'user-id': user.id
	}, me !== null ? me.id : null).then((tl: Post[]) => {
		const timeline: Object[] = tl.map((post: Post) => {
			switch (post.type) {
				case 'status':
					(<any>post).text = parsePostText((<any>post).text, (<any>post).isPlain);
					break;
				default:
					break;
			}
			return post;
		});

		res.display(req, 'user', {
			user: user,
			me: me,
			timeline: timeline
		});
	});
};
