import * as cluster from 'cluster';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as express from 'express';
import * as expressSession from 'express-session';
import * as mongoose from 'mongoose';
import * as MongoStore from 'connect-mongo';
const _MongoStore: MongoStore.MongoStoreFactory = MongoStore(expressSession);
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import { User } from '../models/user';
import namingWorkerId from '../utils/naming-worker-id';

import config from '../config';

import router from './router';

console.log(`Init ${namingWorkerId(cluster.worker.id)} api server...`);

// Grobal options
const sessionExpires: number = 1000 * 60 * 60 * 24 * 365;

// Init DB connection
const db: mongoose.Connection = mongoose.createConnection(config.mongo.uri, config.mongo.options);

// Init server
const app: express.Express = express();
app.disable('x-powered-by');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cookiePass));
app.use(compression());

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
		secure: false,
		expires: new Date(Date.now() + sessionExpires),
		maxAge: sessionExpires
	},
	store: new _MongoStore({
		mongooseConnection: db
	})
}));

app.use((req, res, next) => {
	res.header('X-Frame-Options', 'DENY');

	// APIのレスポンスはキャッシュさせない
	res.header({
		'Cache-Control': 'no-cache, no-store, must-revalidate',
		'Pragma': 'no-cache',
		'Expires': '0'
	});

	// CORS middleware
	res.header({
		'Access-Control-Allow-Origin': config.publicConfig.url,
		'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Credentials': 'true'
	});

	// intercept OPTIONS method
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}

	next();
});

// Init session
app.use((req, res, next) => {
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
		req.user = null;
		next();
	}
});

// Rooting
router(app);

// Not found handling
app.use((req, res) => {
	res.sendStatus(404);
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response) => {
	console.error(err);
	res.status(500).send(err);
});

let server: http.Server | https.Server;
let port: number;

if (config.https.enable) {
	port = config.port.apiHttps;
	server = https.createServer({
		key: fs.readFileSync(config.https.keyPath),
		cert: fs.readFileSync(config.https.certPath)
	}, app);
} else {
	port = config.port.apiHttp;
	server = http.createServer(app);
}

server.listen(port, () => {
	const listenhost: string = server.address().address;
	const listenport: number = server.address().port;

	console.log(
		`\u001b[1;32m${namingWorkerId(cluster.worker.id)} is now listening at ${listenhost}:${listenport} (api)\u001b[0m`);
});
