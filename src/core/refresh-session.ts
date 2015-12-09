import requestApi from '../utils/request-api';
import { UserSettings } from '../models/user-settings';

export default function refreshSession(session: any): Promise<void> {
	'use strict';

	const userId: string = session.userId;

	return new Promise<void>((res, rej) => {
		Promise.all([
			requestApi('account/show', {}, userId),
			UserSettings.findOne({
				userId: userId
			})
		]).then((results: any[]) => {
			session.user = results[0];
			session.userSettings = results[1].toObject();
			session.save(() => {
				res();
			});
		});
	});
}
