import { User } from '../../../../../models/user';
import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';
import parsePostText from '../../../../../utils/parsePostText';
import requestApi from '../../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.data.user;
	const me: User = req.me;

	Promise.all([
		// タイムライン
		requestApi('GET', 'posts/user-timeline', {
			'user-id': user.id
		}, me),
		// 最近の写真
		requestApi('GET', 'posts/user-timeline', {
			'user-id': user.id,
			'types': 'photo'
		}, me)
	]).then(results => {
		const timeline: any = results[0];
		const photoPosts: any = results[1];
		res.display({
			user: user,
			isMe: req.isLogin && user.id.toString() === me.id.toString(),
			timeline,
			photoPosts,
			parsePostText: parsePostText
		});
	});
};
