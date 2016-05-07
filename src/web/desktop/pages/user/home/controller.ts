import * as express from 'express';
import { User } from '../../../../../db/models/user';
import requestApi from '../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	const user: User = res.locals.user;
	const me: User = req.user;

	Promise.all([
		// タイムライン
		requestApi('posts/user-timeline', {
			'user-id': user.id,
			'include-replies': false
		}, me),
		// 最近の写真
		requestApi('posts/user-timeline', {
			'user-id': user.id,
			'types': 'photo'
		}, me)
	]).then(results => {
		const timeline: any = results[0];
		const photoPosts: any = results[1];
		res.locals.display({
			user: user,
			timeline: timeline,
			photoPosts
		}, 'user');
	});
};
