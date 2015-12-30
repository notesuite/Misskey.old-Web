import * as cluster from 'cluster';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as express from 'express';
import * as expressSession from 'express-session';
import * as mongoose from 'mongoose';
import * as MongoStore from 'connect-mongo';
const _MongoStore: MongoStore.MongoStoreFactory = MongoStore(expressSession);
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
const vhost: any = require('vhost');
const cors: any = require('cors');

import { User } from './models/user';
import { UserSettings, IUserSettings, guestUserSettings } from './models/user-settings';
import { MisskeyExpressRequest } from './misskey-express-request';
import { MisskeyExpressResponse } from './misskey-express-response';
import requestApi from './utils/request-api';
import namingWorkerId from './utils/naming-worker-id';
import musics from './utils/musics';

import config from './config';

import router from './router';
import apiRouter from './api/router';

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
const subdomainOptions = {
	base: config.publicConfig.host
};

// Init DB connection
const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

// Init server
const app: express.Express = express();
app.disable('x-powered-by');
app.locals.compileDebug = false;
app.locals.filename = 'jade';
app.locals.cache = true;
// app.locals.pretty = '    ';
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cookiePass));
app.use(compression());
app.use(cors({
	origin: true,
	credentials: true
}));

// Statics
app.use(vhost(config.publicConfig.resourcesHost, (<any>express.static)(`${__dirname}/resources`, {
	fallthrough: true
})));

app.use(require('subdomain')(subdomainOptions));

app.get(`/subdomain/${config.publicConfig.resourcesDomain}/`, (req, res) => {
	res.send(musics());
});

// Statics
app.get('/favicon.ico', (req, res) => {
	res.sendFile(path.resolve(`${__dirname}/favicon.ico`));
});
app.get('/manifest.json', (req, res) => {
	res.sendFile(path.resolve(`${__dirname}/manifest.json`));
});

// Session settings
app.use(expressSession({
	name: config.sessionKey,
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		path: '/',
		domain: `.${config.publicConfig.host}`,
		httpOnly: false,
		secure: config.https.enable,
		expires: new Date(Date.now() + sessionExpires),
		maxAge: sessionExpires
	},
	store: new _MongoStore({
		mongooseConnection: db
	})
}));

app.use((req, res, next) => {
	(<MisskeyExpressRequest>req).isLogin =
		req.hasOwnProperty('session') &&
		req.session !== null &&
		req.session.hasOwnProperty('userId') &&
		(<any>req.session).userId !== null;

	if ((<MisskeyExpressRequest>req).isLogin) {
		req.user = (<any>req.session).userId;
	}

	next();
});

apiRouter(app);

// Init session
app.use((req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
	// Chromeでは ALLOW-FROM をサポートしていないらしい
	// res.header('X-Frame-Options', `ALLOW-FROM ${config.publicConfig.url}`);

	const ua: string = uatype(req.headers['user-agent']);
	const noui: boolean = req.query.hasOwnProperty('noui');

	req.data = {};
	req.ua = ua;
	req.renderData = {
		pagePath: req.path,
		noui: noui,
		config: config.publicConfig,
		login: req.isLogin,
		ua: ua,
		workerId: workerId
	};

	if (req.isLogin) {
		const userId: string = req.session.userId;
		requestApi('account/show', {}, userId).then((user: User) => {
			UserSettings.findOne({
				userId: userId
			}, (err: any, settings: IUserSettings) => {
				req.user = Object.assign({}, user, {_settings: settings});
				req.renderData.me = user;
				req.renderData.userSettings = settings;
				next();
			});
		});
	} else {
		req.user = null;
		req.renderData.me = null;
		req.renderData.userSettings = guestUserSettings;
		next();
	}
});

// Rooting
router(app);

let server: http.Server | https.Server;
let port: number;

if (config.https.enable) {
	port = config.port.https;
	server = https.createServer({
		key: fs.readFileSync(config.https.keyPath),
		cert: fs.readFileSync(config.https.certPath)
	}, app);

	http.createServer((req, res) => {
		res.writeHead(301, {
			Location: config.publicConfig.url + req.url
		});
		res.end();
	}).listen(config.port.http);
} else {
	port = config.port.http;
	server = http.createServer(app);
}

server.listen(port, () => {
	const listenhost: string = server.address().address;
	const listenport: number = server.address().port;

	console.log(
		`\u001b[1;32m${namingWorkerId(cluster.worker.id)} is now listening at ${listenhost}:${listenport}\u001b[0m`);
});
