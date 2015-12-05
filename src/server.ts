import * as cluster from 'cluster';
import * as http from 'http';
import * as path from 'path';
import * as express from 'express';
import * as expressSession from 'express-session';
import * as mongoose from 'mongoose';
import * as MongoStore from 'connect-mongo';
const _MongoStore: MongoStore.MongoStoreFactory = MongoStore(expressSession);
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
// import { logDone, logFailed, logInfo } from 'log-cool';

import { User } from './models/user';
import { MisskeyExpressRequest } from './misskey-express-request';
import { MisskeyExpressResponse } from './misskey-express-response';
import namingWorkerId from './utils/naming-worker-id';
import requestApi from './utils/request-api';

import config from './config';

import router from './router';

function uatype(ua: string): string {
	'use strict';
	if (ua !== undefined && ua !== null) {
		ua = ua.toLowerCase();
		if (/(iphone|ipod|ipad|android.*mobile|windows.*phone|psp|vita|nitro|nintendo)/i.test(ua)) {
			return 'mobile';
		} else {
			return 'desktop';
		}
	} else {
		return 'desktop';
	}
}

console.log(`Init ${namingWorkerId(cluster.worker.id)} server...`);

// Grobal options
const sessionExpires: number = 1000 * 60 * 60 * 24 * 365;
const workerId: string = namingWorkerId(cluster.worker.id);

// Init DB connection
const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

// Init server
const server: express.Express = express();
server.disable('x-powered-by');
server.locals.compileDebug = false;
server.locals.filename = 'jade';
server.locals.cache = true;
// server.locals.pretty = '    ';
server.set('view engine', 'jade');

server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser(config.cookiePass));
server.use(compression());
server.use('/resources', express.static(`${__dirname}/resources`));

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

// Statics
server.get('/favicon.ico', (req: express.Request, res: express.Response) => {
	res.sendFile(path.resolve(`${__dirname}/favicon.ico`));
});
server.get('/manifest.json', (req: express.Request, res: express.Response) => {
	res.sendFile(path.resolve(`${__dirname}/manifest.json`));
});

// Init session
server.use((req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
	res.header('X-Frame-Options', 'SAMEORIGIN');

	const ua: string = uatype(req.headers['user-agent']);

	const isLogin: boolean =
		req.hasOwnProperty('session') &&
		req.session !== null &&
		req.session.hasOwnProperty('userId') &&
		req.session.userId !== null;

	req.data = {};
	req.isLogin = isLogin;
	req.ua = ua;
	req.renderData = {
		pagePath: req.path,
		config: config.publicConfig,
		login: isLogin,
		ua: ua,
		workerId: workerId
	};

	if (isLogin) {
		const userId: string = req.session.userId;
		if (req.session.hasOwnProperty('user')) {
			const user: User = req.session.user;
			req.me = user;
			req.renderData.me = user;
			next();
		} else {
			requestApi('account/show', {}, userId).then((user: User) => {
				req.me = user;
				req.renderData.me = user;
				req.session.user = user;
				req.session.save(() => {
					next();
				});
			}, (err: any) => {
				return res.status(500).send('Sry! Failed lookup of your account. plz try again.');
			});
		}
	} else {
		req.me = null;
		req.renderData.me = null;
		next();
	}
});

// Rooting
router(server);

const httpServer: http.Server = http.createServer(server);

httpServer.listen(config.port.http, () => {
	const host: string = httpServer.address().address;
	const port: number = httpServer.address().port;

	console.log(`\u001b[1;32m${namingWorkerId(cluster.worker.id)} is now listening at ${host}:${port}\u001b[0m`);
});
