import { User } from '../../../../../models/user';
import { IUserSettings } from '../../../../../models/user-settings';
import { MisskeyExpressRequest } from '../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../misskey-express-response';
import requestApi from '../../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const user: User = req.data.user;
	const userSettings: IUserSettings = req.data.userSettings;
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
		res.display({
			user: user,
			isMe: req.isLogin && user.id.toString() === me.id.toString(),
			timeline: timeline,
			overrideTheme: userSettings !== null ? userSettings.theme : null,
			photoPosts
		});
	});
};
