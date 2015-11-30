import * as redis from 'redis';
import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';
const jade: any = require('jade');
import parsePostText from '../../utils/parsePostText';
import requestApi from '../../utils/requestApi';
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
				subscriber.subscribe(`misskey:talk-stream:${socket.user.id}-${socket.otherpartyId}`);
				subscriber.on('message', (_: any, contentString: string) => {
					// メッセージはJSONなのでパース
					const content: any = JSON.parse(contentString);

					switch (content.type) {
						// メッセージ
						case 'me-message':
						case 'otherparty-message':
							// メッセージID
							const messageId: any = content.value.id;

							// メッセージのHTMLコンパイラ
							const compiler: any = jade.compileFile(
								`${__dirname}/../../sites/desktop/common/views/talk/render.jade`, {
									filename: 'jade',
									cache: true
							});

							// メッセージの詳細を取得
							requestApi('GET', 'talks/show', {
								'message-id': messageId
							}, socket.user.id).then((message: Object) => {
								// HTMLにしてクライアントに送信
								socket.emit(content.type, compiler({
									parsePostText: parsePostText,
									message: message,
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
			socket.on('read', (id: string) => {
				requestApi('POST', 'talks/read', {
					'message-id': id
				}, socket.user.id);
			});

			socket.on('disconnect', () => {
				subscriber.end();
			});
		});
	});
};
