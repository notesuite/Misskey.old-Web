import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';

import { User } from '../../models/user';
import { UserSettings, IUserSettings } from '../../models/user-settings';
import requestApi from '../../utils/request-api';
import config from '../../config';

export default function getSessionUser(socket: SocketIO.Socket, sessionStore: any): Promise<Object[]> {
	'use strict';
	return new Promise<Object>((resolve, reject) => {
		// Get cookies
		const cookies: { [key: string]: string } = cookie.parse(socket.handshake.headers.cookie);

		// Get sesson key
		const sid: string = cookies[config.sessionKey];
		const sidkey: string = sid.match(/s:(.+?)\./)[1];

		// Resolve session
		sessionStore.get(sidkey, (err: any, session: any) => {
			if (err !== null) {
				return console.error(err);
			} else if (session === null) {
				return;
			}

			const userId: string = session.userId;
			requestApi('account/show', {}, userId).then((user: User) => {
				UserSettings.findOne({
					userId: userId
				}, (_: any, settings: IUserSettings) => {
					user._settings = settings;
					resolve(user);
				});
			});
		});
	});
}
