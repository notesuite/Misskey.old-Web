import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';
import config from '../../config';

export default function getSession(socket: SocketIO.Socket, sessionStore: any): Promise<Object[]> {
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

			resolve(session);
		});
	});
}
