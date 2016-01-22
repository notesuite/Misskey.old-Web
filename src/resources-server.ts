import * as express from 'express';
const cors: any = require('cors');

export default function server(): express.Express {
	'use strict';

	// Init server
	const app: express.Express = express();
	app.disable('x-powered-by');

	// CORS
	app.use(cors({
		origin: true,
		credentials: false
	}));

	// SVGZ
	// see: https://github.com/strongloop/express/issues/1911
	app.get(/.svgz/, (req, res, next) => {
		res.set({'Content-Encoding': 'gzip'});
		next();
	});

	app.use(express.static(`${__dirname}/resources`));

	// Not found handling
	app.use((req, res) => {
		res.status(404).send('not-found');
	});

	return app;
}
