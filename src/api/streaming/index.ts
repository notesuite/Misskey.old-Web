import * as http from 'http';
import * as session from 'express-session';
import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';
import * as mongoose from 'mongoose';
import * as MongoStore from 'connect-mongo';
const _MongoStore: MongoStore.MongoStoreFactory = MongoStore(session);
import config from '../../config';

const server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});
	res.end('kyoppie');
});

const io: SocketIO.Server = SocketIO.listen(server);

// Init DB connection
const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

const sessionStore: any = new _MongoStore({
	mongooseConnection: db
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
