import * as express from 'express';
import { User } from '../../../../db/models/user';
import { Post } from '../../../../db/models/post';
import requestApi from '../../../../core/request-api';
const getPostSuumary = require('../../../common/scripts/get-post-summary');

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	const user: User = res.locals.user;
	const post: any = res.locals.post;
	const me: User = req.user;

	Promise.all([
		new Promise<any>((resolve, reject) => {
			requestApi('posts/replies/show', {
				'post-id': post.id
			}, me).then((replies: Post[]) => {
				if (replies.length === 0) {
					return resolve([]);
				}
				Promise.all(replies.map((reply: any) => {
					return new Promise<Object>((resolve2, reject2) => {
						requestApi('posts/replies/show', {
							'post-id': reply.id
						}, me).then((repliesOfReply: Post[]) => {
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
		res.locals.display({
			user: user,
			post: post,
			summary: getPostSuumary(res.locals.lang, post),
			replies: results[0],
			likes: results[1],
			reposts: results[2]
		});
	});
};
