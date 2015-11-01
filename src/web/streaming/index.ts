import * as http from 'http';
import * as session from 'express-session';
import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';
import config from '../../config';

console.log('Init Web streaming server');

const server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});
	res.end('kyoppie');
});

const io: SocketIO.Server = SocketIO.listen(server);

const RedisStore: any = require('connect-redis')(session);
const sessionStore: any = new RedisStore({
	db: 1,
	prefix: 'misskey-session:'
});

// Authorization
io.use((socket: SocketIO.Socket, next: (err?: any) => void) => {
	const rawCookie: string = socket.request.headers.cookie;
	const parsedCookie: { [key: string]: string } = cookie.parse(rawCookie);
	const isAuthorized: boolean = /s:(.+?)\./.test(parsedCookie[config.sessionKey]);
	if (isAuthorized) {
		next();
	} else {
		next(new Error('[[error:not-authorized]]'));
	}
});

// Home stream
require('./home')(io, sessionStore);

server.listen(config.port.streaming);
