import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as session from 'express-session';
import * as SocketIO from 'socket.io';
import * as cookie from 'cookie';
import * as mongoose from 'mongoose';
import * as MongoStore from 'connect-mongo';
const _MongoStore: MongoStore.MongoStoreFactory = MongoStore(session);
import config from '../../config';

let server: http.Server | https.Server;

if (config.https.enable) {
	server = https.createServer({
		key: fs.readFileSync(config.https.keyPath),
		cert: fs.readFileSync(config.https.certPath)
	});
} else {
	server = http.createServer();
}

const io = SocketIO.listen(server);

// Init DB connection
const db = mongoose.createConnection(config.mongo.uri, config.mongo.options);

const sessionStore: any = new _MongoStore({
	mongooseConnection: db
});

// Authorization
io.use((socket: SocketIO.Socket, next: (err?: any) => void) => {
	const rawCookie: string = socket.request.headers.cookie;
	let isAuthorized: boolean;
	if (rawCookie !== undefined && rawCookie !== null) {
		const parsedCookie: { [key: string]: string } = cookie.parse(rawCookie);
		isAuthorized = /s:(.+?)\./.test(parsedCookie[config.sessionKey]);
	} else {
		isAuthorized = false;
	}
	if (isAuthorized) {
		next();
	} else {
		next(new Error('[[error:not-authorized]]'));
	}
});

require('./home')(io, sessionStore);
require('./talk')(io, sessionStore);

server.listen(config.bindPorts.streaming);
