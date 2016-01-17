import * as express from 'express';
import config from '../../../../../config';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';
	res.locals.display({
		env: process.env.NODE_ENV,
		tls: config.https.enable,
		host: config.publicConfig.host
	});
};
