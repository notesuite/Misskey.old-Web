import { User } from '../../../../models/user';
import { Post } from '../../../../models/post';
import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
import parsePostText from '../../../../utils/parsePostText';
import requestApi from '../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.data.user;
	const post: any = req.data.post;
	const me: User = req.me;

	requestApi('GET', 'posts/replies', {
		'post-id': post.id
	}, me !== null ? me.id : null).then((replies: Post[]) => {
		Promise.all(replies.map((reply: any) => {
			return new Promise<Object>((resolve, reject) => {
				requestApi('GET', 'posts/replies', {
					'post-id': reply.id
				}, me !== null ? me.id : null).then((repliesOfReply: Post[]) => {
					reply.replies = repliesOfReply;
					resolve(reply);
				});
			});
		})).then((transformedReplies: any) => {
			res.display({
				user: user,
				post: post,
				likes: null,
				reposts: null,
				replies: transformedReplies,
				parsePostText: parsePostText
			});
		});
	});
};
