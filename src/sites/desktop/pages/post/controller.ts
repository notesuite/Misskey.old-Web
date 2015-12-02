import { User } from '../../../../models/user';
import { Post } from '../../../../models/post';
import { MisskeyExpressRequest } from '../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../misskey-express-response';
import requestApi from '../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.data.user;
	const post: any = req.data.post;
	const me: User = req.me;

	requestApi('posts/replies', {
		'post-id': post.id
	}, me !== null ? me.id : null).then((replies: Post[]) => {
		Promise.all(replies.map((reply: any) => {
			return new Promise<Object>((resolve, reject) => {
				requestApi('posts/replies', {
					'post-id': reply.id
				}, me).then((repliesOfReply: Post[]) => {
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
				replies: transformedReplies
			});
		});
	});
};
