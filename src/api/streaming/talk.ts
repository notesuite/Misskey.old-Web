import * as redis from 'redis';
import * as SocketIO from 'socket.io';
import requestApi from '../../utils/request-api';
import getSession from './get-session';
import config from '../../config';

interface MKSocketIOSocket extends SocketIO.Socket {
	user: any;
	otherpartyId: string;
}

module.exports = (io: SocketIO.Server, sessionStore: any) => {
	io.of('/streaming/talk').on('connection', (socket: MKSocketIOSocket) => {
		getSession(socket, sessionStore).then((session: any) => {
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

			socket.on('disconnect', () => {
				subscriber.end();
			});
		});

		function onStreamMessage(_: any, contentString: string): void {
			'use strict';

			// メッセージはJSONなのでパース
			const content: any = JSON.parse(contentString);

			switch (content.type) {
				case 'message':
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
