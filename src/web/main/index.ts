// import * as http from 'http';
import * as path from 'path';
import * as express from 'express';
import * as expressSession from 'express-session';
import * as mongoose from 'mongoose';
import * as MongoStore from 'connect-mongo';
const _MongoStore: MongoStore.MongoStoreFactory = MongoStore(expressSession);
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
// import * as expressMinify from 'express-minify';
const expressMinify: any = require('express-minify');
import * as moment from 'moment';

import { User } from '../models/user';
import { MisskeyExpressRequest } from '../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../misskeyExpressResponse';
import requestApi from '../../utils/requestApi';

import config from '../../config';

import router from './router';

console.log('Init Web server');

// Grobal options
const sessionExpires: number = 1000 * 60 * 60 * 24 * 365;
const htmlpretty: string = '  ';

// Init DB connection
const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

// Init server
const server: express.Express = express();
server.locals.compileDebug = false;
server.locals.pretty = htmlpretty;
server.set('view engine', 'jade');
server.set('views', `${__dirname}/views/pages`);
server.set('X-Frame-Options', 'SAMEORIGIN');

server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser(config.cookiePass));
server.use(compression());
server.use(expressMinify());

// Session settings
server.use(expressSession({
	name: config.sessionKey,
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		path: '/',
		domain: ".#{config.public-config.domain}",
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
	res.sendFile(path.resolve(`${__dirname}/resources/favicon.ico`));
});
server.get('/manifest.json', (req: express.Request, res: express.Response) => {
	res.sendFile(path.resolve(`${__dirname}/resources/manifest.json`));
});

// Init session
server.all('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
	const uastring: string = req.headers['user-agent'];
	const ua: string = ((): string => {
		if (uastring !== null) {
			if (/(iphone|ipod|ipad|android.*mobile|windows.*phone|psp|vita|nitro|nintendo)/i.test(uastring.toLowerCase())) {
				return 'mobile';
			} else {
				return 'desktop';
			}
		} else {
			return 'desktop';
		}
	})();

	const isLogin: boolean =
		req.hasOwnProperty('session') &&
		req.session !== null &&
		req.session.hasOwnProperty('userId') &&
		req.session.userId !== null;

	req.isLogin = isLogin;
	req.ua = ua;
	req.renderData = { // Render data
		pagePath: req.path,
		config: config.publicConfig,
		url: config.publicConfig.url,
		apiUrl: config.publicConfig.apiUrl,
		webStreamingUrl: config.publicConfig.webStreamingUrl,
		login: isLogin,
		ua: ua,
		moment: moment
	};

	// Check logged in, set user instance if logged in
	if (isLogin) {
		const userId: string = req.session.userId;
		requestApi("GET", "users/show", { "user-id": userId }).then((user: User) => {
			req.me = user;
			req.renderData.me = user;
			next();
		});
	} else {
		req.me = null;
		req.renderData.me = null;
		next();
	}

	// Renderer function
	res.display = (sessionreq: MisskeyExpressRequest, viewName: string, renderData?: any): void => {
		const viewPath: string = `${sessionreq.ua}/views/${viewName}`;
		if (renderData !== null) {
			res.render(viewPath, mix(sessionreq.renderData, renderData));
		} else {
			res.render(viewPath, sessionreq.renderData);
		}
		function mix(obj: any, src: any): any {
			const own: (v: string) => boolean = {}.hasOwnProperty;
			for (var key in src) {
				if (own.call(src, key)) {
					obj[key] = src[key];
				}
			}
			return obj;
		}
	};
});

// General rooting
router(server);

// Not found handling
server.use((req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
	res.status(404);
	res.display(req, 'not-found', {});
});

// Error handling
server.use((err: any, req: express.Request, res: express.Response, next: () => void) => {
	console.error(err);
	const displayErr: string = `${err.stack}\r\n----------------\r\n${req.method} ${req.url} [${new Date()}]`;
	res.status(500);
	if (res.hasOwnProperty('display')) {
		(<any>res).display(req, res, 'error', { err: displayErr });
	} else {
		res.send(err);
	}
});

exports.server = server;
