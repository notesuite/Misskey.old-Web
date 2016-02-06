import * as express from 'express';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';
	res.locals.display({}, 'i/settings/_common');
};
