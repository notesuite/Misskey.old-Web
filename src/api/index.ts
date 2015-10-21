// import * as http from 'http';
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

import { MisskeyExpressRequest } from '../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../misskeyExpressResponse';

import config from '../config';

import router from './router';

console.log('Init Web API relay server');

// Init DB connection
const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

// Init server
const server: express.Express = express();
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
		domain: `.${config.publicConfig.host}`
	},
	store: new _MongoStore({
		mongooseConnection: db
	})
}));

// CORS middleware
server.use((req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
	res.header('Access-Control-Allow-Origin', config.publicConfig.host);
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');

	next();
});

// Init session
server.all('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
	req.isLogin =
		req.hasOwnProperty('session') &&
		req.session !== null &&
		req.session.hasOwnProperty('userId') &&
		req.session.userId !== null;

	next();
});

// Rooting
router(server);

// Not found handling
server.use((req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
	res.status(404);
	res.display(req, 'not-found', {});
});

exports.server = server;
