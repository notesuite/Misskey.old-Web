import * as redis from 'redis';
import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';
import requestApi from '../../utils/request-api';
import config from '../../config';

interface MKSocketIOSocket extends SocketIO.Socket {
	user: any;
	otherpartyId: string;
}

module.exports = (io: SocketIO.Server, sessionStore: any) => {
	io.of('/streaming/talk').on('connection', (socket: MKSocketIOSocket) => {
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

			socket.emit('connected');
			socket.on('init', (req: any) => {
				const otherpartyId: string = req['otherparty-id'];
				socket.otherpartyId = otherpartyId;

				// Subscribe Talk stream channel
				subscriber.subscribe(`misskey:talk-user-stream:${socket.user.id}-${socket.otherpartyId}`);
				subscriber.on('message', onStreamMessage);
			});

			socket.on('read', (id: string) => {
				requestApi('talks/messages/read', {
					'message-id': id
				}, socket.user.id);
			});

			socket.on('disconnect', () => {
				subscriber.end();
			});
		});

		function onStreamMessage(_: any, contentString: string): void {
			'use strict';

			// メッセージはJSONなのでパース
			const content: any = JSON.parse(contentString);

			switch (content.type) {
				case 'me-message':
				case 'otherparty-message':
					const messageId: any = content.value.id;

					requestApi('talks/messages/show', {
						'message-id': messageId
					}, socket.user.id).then((message: Object) => {
						socket.emit(content.type, message);
					});
					break;
				default:
					socket.emit(content.type, content.value);
					break;
			}
		}
	});
};
