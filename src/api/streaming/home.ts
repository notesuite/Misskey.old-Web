import * as redis from 'redis';
import * as SocketIO from 'socket.io';
import requestApi from '../../core/request-api';
import getSessionUser from './get-session-user';
import config from '../../config';

interface MKSocketIOSocket extends SocketIO.Socket {
	user: any;
}

module.exports = (io: SocketIO.Server, sessionStore: any) => {
	io.of('/streaming/home').on('connection', (socket: MKSocketIOSocket) => {
		getSessionUser(socket, sessionStore).then((user: any) => {
			socket.user = user;

			// Connect to Redis
			const subscriber: redis.RedisClient = redis.createClient(
				6379, config.redis.host, <redis.ClientOpts>{
				auth_pass: config.redis.pass,
				disable_resubscribing: true
			});

			// Subscribe Home stream channel
			subscriber.subscribe(`misskey:user-stream:${socket.user.id}`);
			subscriber.on('message', onStreamMessage);

			socket.on('disconnect', () => {
				subscriber.end();
			});
		});

		function onStreamMessage(_: any, contentString: string): void {
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
