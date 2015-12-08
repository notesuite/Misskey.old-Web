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

	Promise.all([
		new Promise<Object>((resolve, reject) => {
			requestApi('posts/replies/show', {
				'post-id': post.id
			}, me !== null ? me.id : null).then((replies: Post[]) => {
				Promise.all(replies.map((reply: any) => {
					return new Promise<Object>((resolve2, reject2) => {
						requestApi('posts/replies/show', {
							'post-id': reply.id
						}, me).then((repliesOfReply: Post[]) => {
							reply.replies = repliesOfReply;
							resolve2(reply);
						});
					});
				}));
			});
		}),
		new Promise<Object>((resolve, reject) => {
			requestApi('posts/likes/show', {
				'post-id': post.id
			}, me !== null ? me.id : null).then((likes: any[]) => {
				resolve(likes);
			});
		}),
		new Promise<Object>((resolve, reject) => {
			requestApi('posts/reposts/show', {
				'post-id': post.id
			}, me !== null ? me.id : null).then((reposts: any[]) => {
				resolve(reposts);
			});
		})
	]).then((results: any[]) => {
		res.display({
			user: user,
			post: post,
			replies: results[0],
			likes: results[1],
			reposts: results[2]
		});
	});
};
