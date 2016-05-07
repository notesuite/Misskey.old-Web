import * as express from 'express';
import * as expressSession from 'express-session';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as csrf from 'csurf';
const cors: any = require('cors');

import config from '../config';

import router from './router';

export default function(session: any): express.Express {
	// Init server
	const app: express.Express = express();
	app.disable('x-powered-by');

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser(config.cookiePass));

	// Session settings
	app.use(expressSession(session));

	// CSRF
	app.use(csrf({
		cookie: false
	}));

	// CORS
	app.use(cors({
		origin: true,
		credentials: true
	}));

	app.use((req, res, next) => {
		res.header('X-Frame-Options', 'DENY');
		next();
	});

	router(app);

	return app;
}
