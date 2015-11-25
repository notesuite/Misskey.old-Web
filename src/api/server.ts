import * as cluster from 'cluster';
import * as http from 'http';
import * as express from 'express';
import * as expressSession from 'express-session';
import * as mongoose from 'mongoose';
import * as MongoStore from 'connect-mongo';
const _MongoStore: MongoStore.MongoStoreFactory = MongoStore(expressSession);
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import { User } from '../models/user';
import namingWorkerId from '../utils/namingWorkerId';

import config from '../config';

import router from './router';

console.log(`Init ${namingWorkerId(cluster.worker.id)} api server...`);

// Grobal options
const sessionExpires: number = 1000 * 60 * 60 * 24 * 365;

// Init DB connection
const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

// Init server
const server: express.Express = express();
server.disable('x-powered-by');

server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser(config.cookiePass));
server.use(compression());

// Session settings
server.use(expressSession({
	name: config.sessionKey,
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		path: '/',
		domain: `.${config.publicConfig.host}`,
		httpOnly: false,
		secure: false,
		expires: new Date(Date.now() + sessionExpires),
		maxAge: sessionExpires
	},
	store: new _MongoStore({
		mongooseConnection: db
	})
}));

server.use((req, res, next) => {
	res.set('X-Frame-Options', 'DENY');

	// CORS middleware
	res.set({
		'Access-Control-Allow-Origin': config.publicConfig.url,
		'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Credentials': 'true'
	});

	 // intercept OPTIONS method
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
	}

	// APIのレスポンスはキャッシュさせない
	res.set({
		'Cache-Control': 'no-cache, no-store, must-revalidate',
		'Pragma': 'no-cache',
		'Expires': '0'
	});

	next();
});

// Init session
server.use((req, res, next) => {
	const isLogin: boolean =
		req.hasOwnProperty('session') &&
		req.session !== null &&
		req.session.hasOwnProperty('userId') &&
		(<any>req.session).userId !== null;

	if (isLogin) {
		if (req.session.hasOwnProperty('user')) {
			const user: User = (<any>req.session).user;
			req.user = user;
			next();
		} else {
			res.sendStatus(401);
		}
	} else {
		res.sendStatus(401);
	}
});

// Rooting
router(server);

// Not found handling
server.use((req, res) => {
	res.sendStatus(404);
});

// Error handling
server.use((err: any, req: express.Request, res: express.Response) => {
	console.error(err);
	res.status(500).send(err);
});

const httpServer: http.Server = http.createServer(server);

httpServer.listen(config.port.apiHttp, () => {
	const host: string = httpServer.address().address;
	const port: number = httpServer.address().port;

	console.log(`\u001b[1;32m${namingWorkerId(cluster.worker.id)} is now listening at ${host}:${port} (api)\u001b[0m`);
});

require('./streaming');
