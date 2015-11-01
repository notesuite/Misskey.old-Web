import * as redis from 'redis';
import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';
import config from '../../config';

interface MKSocketIOSocket extends SocketIO.Socket {
	user: any;
}

module.exports = (io: SocketIO.Server, sessionStore: any) => {
	io.of('/streaming/home').on('connection', (socket: MKSocketIOSocket) => {
		// Connect to Redis
		const subscriber: redis.RedisClient = redis.createClient();

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

			// Subscribe Home stream channel
			subscriber.subscribe(`misskey:userStream:${socket.user.id}`);
			subscriber.on('message', (_: any, contentString: string) => {
				const content: any = JSON.parse(contentString);
				switch (content.type) {
					case 'post':
						socket.emit('post', 'kyoppie');
						console.log('kyooopie');
						break;
					default:
						break;
				}
			});
		});
	});
};
