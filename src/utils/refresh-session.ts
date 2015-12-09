import requestApi from './request-api';
import { UserSetting } from '../models/user-setting';

export default function refreshSession(session: any): Promise<void> {
	'use strict';

	const userId: string = session.userId;

	return new Promise<void>((res, rej) => {
		Promise.all([
			requestApi('account/show', {}, userId),
			UserSetting.findOne({
				userId: userId
			})
		]).then((results: any[]) => {
			session.user = results[0];
			session.userSetting = results[1].toObject();
			session.save(() => {
				res();
			});
		});
	});
}
