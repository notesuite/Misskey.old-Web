import * as express from 'express';
import { User } from '../../../../db/models/user';
import requestApi from '../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	const user: User = res.locals.user;
	const post: any = res.locals.post;
	const me: User = req.user;

	Promise.all([
		new Promise<any>((resolve, reject) => {
			requestApi('posts/replies/show', {
				'post-id': post.id
			}, me).then((replies: any[]) => {
				if (replies.length === 0) {
					resolve([]);
				} else {
					resolve(replies);
				}
			});
		}),
		new Promise<any>((resolve, reject) => {
			if (post.type === 'reply') {
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
		console.log(results[0]);
		res.locals.display({
			user: user,
			post: post,
			replies: results[0],
			talk: results[1],
			likes: results[2],
			reposts: results[2]
		});
	});
};
