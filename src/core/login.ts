import requestApi from '../utils/request-api';
import { UserSettings, IUserSettings } from '../models/user-settings';

const defaultHomeLayout: any = {
	left: [],
	center: ['timeline'],
	right: ['my-status', 'notifications', 'recommendation-users', 'donate', 'ad']
};

export default function login(screenName: string, password: string, session: any): Promise<void> {
	'use strict';

	return new Promise<void>((resove, reject) => {
		requestApi('login', {
			'screen-name': screenName,
			'password': password
		}).then((user: any) => {
			// ユーザー設定引き出し
			UserSettings.findOne({
				userId: user.id
			}, (err: any, settings: IUserSettings) => {
				if (err !== null) {
					return reject();
				}
				if (settings === null) {
					// ユーザー設定が無ければ作成
					UserSettings.create({
						userId: user.id,
						theme: null,
						homeLayout: defaultHomeLayout
					}, (createErr: any, created: IUserSettings) => {
						saveSession(user, created);
					});
				} else {
					saveSession(user, settings);
				}
			});
		}, (err: any) => {
			reject();
		});

		function saveSession(user: any, settings: IUserSettings): void {
			session.userId = user.id;
			session.userSettings = settings.toObject();
			session.save(() => {
				resove();
			});
		}
	});
}
