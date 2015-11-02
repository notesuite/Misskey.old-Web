import * as redis from 'redis';
import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';
const jade: any = require('jade');
import requestApi from '../../utils/requestApi';
import config from '../../config';

interface MKSocketIOSocket extends SocketIO.Socket {
	user: any;
}

module.exports = (io: SocketIO.Server, sessionStore: any) => {
	io.of('/streaming/home').on('connection', (socket: MKSocketIOSocket) => {

		// Connect to Redis
		const subscriber: redis.RedisClient = redis.createClient(6379, config.redisServerHost);

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
				// メッセージはJSONなのでパース
				const content: any = JSON.parse(contentString);

				switch (content.type) {
					// 投稿
					case 'post':
						// 投稿ID
						const postId: any = content.value.id;

						// 投稿のHTMLコンパイラ
						const compiler: any = jade.compileFile(
							`${__dirname}/../../web/sites/desktop/views/dynamic-parts/post/smart.jade`);

						// 投稿の詳細を取得
						requestApi('GET', 'posts/show', {'post-id': postId}, socket.user.id).then((res: any) => {
							// HTMLにしてクライアントに送信
							socket.emit(content.type, compiler({
								post: res,
								me: socket.user,
								config: config.publicConfig
							}));
						});
						break;
					default:
						break;
				}
			});
		});
	});
};
