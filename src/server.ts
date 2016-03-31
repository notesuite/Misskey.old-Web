//////////////////////////////////////////////////
// WEB SERVER
//////////////////////////////////////////////////

import * as cluster from 'cluster';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as express from 'express';
import * as expressSession from 'express-session';
import * as MongoStore from 'connect-mongo';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as csrf from 'csurf';
const vhost: any = require('vhost');

import name from './core/naming-worker-id';

import config from './config';

import api from './api/server';
import resources from './resources-server';
import router from './router';

const worker = cluster.worker;

console.log(`Init ${name(worker.id)} server...`);

//////////////////////////////////////////////////
// SERVER OPTIONS

const store = MongoStore(expressSession);

const sessionExpires = 1000 * 60 * 60 * 24 * 365; // One Year
const subdomainOptions = {
	base: config.public.domain
};

const session: any = {
	name: config.sessionKey,
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		path: '/',
		domain: `.${config.publicConfig.host}`,
		httpOnly: true,
		secure: config.https.enable,
		expires: new Date(Date.now() + sessionExpires),
		maxAge: sessionExpires
	},
	store: new store({
		mongooseConnection: db
	})
};

//////////////////////////////////////////////////
// INIT SERVER PHASE

const app: express.Express = express();
app.disable('x-powered-by');
app.locals.compileDebug = false;
app.locals.cache = true;
// app.locals.pretty = '    ';
app.set('view engine', 'jade');

// Init API server
app.use(vhost(config.publicConfig.webApiHost, api(session)));

// Init static resources server
app.use(vhost(config.publicConfig.resourcesHost, resources()));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cookiePass));
app.use(compression());

// CORS
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', config.publicConfig.url);
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, csrf-token');
	res.header('Access-Control-Allow-Credentials', 'true');

	// intercept OPTIONS method
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
	} else {
		next();
	}
});

// Session settings
app.use(expressSession(session));

// CSRF
app.use(csrf({
	cookie: false
}));
app.use((req, res, next) => {
	res.locals.csrftoken = req.csrfToken();
	next();
});

app.use(require('subdomain')(subdomainOptions));

// HSTS
if (config.https.enable) {
	app.use((req, res, next) => {
		res.header('Strict-Transport-Security', 'max-age=10886400; includeSubDomains; preload');
		next();
	});
}

// Statics
app.get('/favicon.ico', (req, res) => {
	res.sendFile(path.resolve(`${__dirname}/favicon.ico`));
});
app.get('/manifest.json', (req, res) => {
	res.sendFile(path.resolve(`${__dirname}/manifest.json`));
});

// Main routing
router(app);

//////////////////////////////////////////////////
// LISTEN PHASE

let server: http.Server | https.Server;
let port: number;

if (config.https.enable) {
	port = config.port.https;
	server = https.createServer({
		key: fs.readFileSync(config.https.keyPath),
		cert: fs.readFileSync(config.https.certPath)
	}, app);

	// 非TLSはリダイレクト
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
		`\u001b[1;32m${name(worker.id)} is now listening at ${listenhost}:${listenport}\u001b[0m`);
});
