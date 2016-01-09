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

	app.use(express.static(`${__dirname}/resources`));

	// Not found handling
	app.use((req, res) => {
		res.status(404).send('not-found');
	});

	return app;
}
