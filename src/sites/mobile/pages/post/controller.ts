import { User } from '../../../../models/user';
import { MisskeyExpressRequest } from '../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../misskey-express-response';
import requestApi from '../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.data.user;
	const post: any = req.data.post;
	const me: User = req.user;

	Promise.all([
		new Promise<any>((resolve, reject) => {
			requestApi('posts/replies/show', {
				'post-id': post.id
			}, me).then((replies: any[]) => {
				if (replies.length === 0) {
					return resolve([]);
				}
				Promise.all(replies.map((reply: any) => {
					return new Promise<Object>((resolve2, reject2) => {
						requestApi('posts/replies/show', {
							'post-id': reply.id
						}, me).then((repliesOfReply: any[]) => {
							reply.replies = repliesOfReply;
							resolve2(reply);
						});
					});
				})).then((replies2: any[]) => {
					resolve(replies2);
				});
			});
		}),
		new Promise<any>((resolve, reject) => {
			if (post.inReplyToPost !== null) {
				requestApi('posts/talk/show', {
					'post-id': post.inReplyToPost.id
				}, me).then((talk: any[]) => {
					resolve(talk);
				});
			} else {
				resolve([]);
			}
		}),
		new Promise<any>((resolve, reject) => {
			requestApi('posts/likes/show', {
				'post-id': post.id
			}, me).then((likes: any[]) => {
				resolve(likes);
			});
		}),
		new Promise<any>((resolve, reject) => {
			requestApi('posts/reposts/show', {
				'post-id': post.id
			}, me).then((reposts: any[]) => {
				resolve(reposts);
			});
		})
	]).then((results: any[]) => {
		res.display({
			user: user,
			post: post,
			replies: results[0],
			talk: results[1],
			likes: results[2],
			reposts: results[2]
		});
	});
};
