import * as redis from 'redis';
import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';
import requestApi from '../../utils/request-api';
import config from '../../config';

interface MKSocketIOSocket extends SocketIO.Socket {
	user: any;
}

module.exports = (io: SocketIO.Server, sessionStore: any) => {
	io.of('/streaming/home').on('connection', (socket: MKSocketIOSocket) => {
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

			// Get user
			socket.user = session.user;

			// Connect to Redis
			const subscriber: redis.RedisClient = redis.createClient(
				6379, config.redisServerHost, <redis.ClientOpts>{
				disable_resubscribing: true
			});

			// Subscribe Home stream channel
			subscriber.subscribe(`misskey:user-stream:${socket.user.id}`);
			subscriber.on('message', onMessage);

			socket.on('disconnect', () => {
				subscriber.end();
			});
		});

		function onMessage(_: any, contentString: string): void {
			'use strict';

			// メッセージはJSONなのでパース
			const content: any = JSON.parse(contentString);

			switch (content.type) {
				case 'post':
					const postId: any = content.value.id;

					requestApi('posts/show', {
						'post-id': postId
					}, socket.user.id).then((post: Object) => {
						socket.emit(content.type, post);
					});
					break;

				case 'notification':
					const notificationId: any = content.value.id;

					requestApi('notifications/show', {
						'notification-id': notificationId
					}, socket.user.id).then((notification: Object) => {
						socket.emit(content.type, notification);
					});
					break;
				default:
					socket.emit(content.type, content.value);
					break;
			}
		}
	});
};
