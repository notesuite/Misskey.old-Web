import * as express from 'express';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';
	res.locals.display({
		env: process.env.NODE_ENV
	});
};
