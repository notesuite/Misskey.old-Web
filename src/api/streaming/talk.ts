import * as redis from 'redis';
import * as SocketIO from 'socket.io';
import requestApi from '../../core/request-api';
import getSessionUser from './get-session-user';
import config from '../../config';

interface MKSocket extends SocketIO.Socket {
	user: any;
}

interface MKUserSocket extends MKSocket {
	otherpartyId: string;
}

interface MKGroupSocket extends MKSocket {
	groupId: string;
}

function createRedisClient(): redis.RedisClient {
	return redis.createClient(
		6379, config.redis.host, <redis.ClientOpts>{
		auth_pass: config.redis.pass,
		disable_resubscribing: true
	});
}

module.exports = (io: SocketIO.Server, sessionStore: any) => {
	io.of('/streaming/talk').on('connection', (socket: MKUserSocket) => {
		getSessionUser(socket, sessionStore).then((user: any) => {
			socket.user = user;
			const subscriber = createRedisClient();

			socket.emit('connected');

			socket.on('init', (req: any) => {
				const otherpartyId: string = req['otherparty-id'];
				socket.otherpartyId = otherpartyId;

				subscriber.subscribe(`misskey:talk-user-stream:${socket.user.id}-${socket.otherpartyId}`);
				subscriber.on('message', onStreamMessage);

				socket.emit('initialized');
			});

			socket.on('disconnect', () => {
				subscriber.end();
			});
		});

		function onStreamMessage(_: any, contentString: string): void {
						streamingMessageHandler(socket, contentString);
		}
	});

	io.of('/streaming/group-talk').on('connection', (socket: MKGroupSocket) => {
		getSessionUser(socket, sessionStore).then((user: any) => {
			socket.user = user;
			const subscriber = createRedisClient();

			socket.emit('connected');

			socket.on('init', (req: any) => {
				const groupId: string = req['group-id'];
				socket.groupId = groupId;

				subscriber.subscribe(`misskey:talk-group-stream:${socket.groupId}`);
				subscriber.on('message', onStreamMessage);

				socket.emit('initialized');
			});

			socket.on('disconnect', () => {
				subscriber.end();
			});
		});

		function onStreamMessage(_: any, contentString: string): void {
						streamingMessageHandler(socket, contentString);
		}
	});
};

function streamingMessageHandler(socket: MKSocket, contentString: string): void {

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
