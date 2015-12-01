import { User } from '../../../../../models/user';
import { MisskeyExpressRequest } from '../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../misskey-express-response';
import parsePostText from '../../../../../utils/parse-post-text';
import requestApi from '../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.data.user;
	const me: User = req.me;

	Promise.all([
		// タイムライン
		requestApi('posts/user-timeline', {
			'user-id': user.id
		}, me),
		// 最近の写真
		requestApi('posts/user-timeline', {
			'user-id': user.id,
			'types': 'photo'
		}, me)
	]).then(results => {
		const timeline: any = results[0];
		const photoPosts: any = results[1];
		Promise.all(timeline.map((post: any) => new Promise<any>((resolve, reject) => {
			const postEx: any = post;
			requestApi('posts/talk/show', {
				'post-id': post.id
			}, me).then((talk: any[]) => {
				requestApi('posts/replies/show', {
					'post-id': post.id
				}, me).then((replies: any[]) => {
					requestApi('posts/likes/show', {
						'post-id': post.id
					}, me).then((likes: any[]) => {
						postEx.talk = talk;
						postEx.replies = replies;
						postEx.likers = likes.map(like => like.user);
						resolve(postEx);
					}, reject);
				}, reject);
			}, reject);
		}))).then((timelineEx: any[]) => {
			console.log(timelineEx);
			res.display({
				user: user,
				isMe: req.isLogin && user.id.toString() === me.id.toString(),
				timeline: timelineEx,
				photoPosts,
				parsePostText: parsePostText
			});
		});
	});
};
