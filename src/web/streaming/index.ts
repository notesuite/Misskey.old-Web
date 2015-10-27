import * as http from 'http';
import * as session from 'express-session';
import * as SocketIO from 'socket.io';
import config from '../../../config';

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

io.use((socket: SocketIO.Socket, next: (err: any) => void) => {
/*  rawCookie = socket != null ? (ref$ = socket.request) != null ? (ref1$ = ref$.headers) != null ? ref1$.cookie : void 8 : void 8 : void 8;
  if (cookie) {
    parsedCookie = cookie.parse(rawCookie);
    isAuthorized = !/s:(.+?)\./.test(parsedCookie[config.sessionKey]);
    if (isAuthorized) {
      return next(new Error('[[error:not-authorized]]'));
    } else {
      return next();
    }
  }
*/
});

console.log(sessionStore);

server.listen(config.port.streaming);
