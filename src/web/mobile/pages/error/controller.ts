import * as express from 'express';

module.exports = (req: express.Request, res: express.Response, err: Error): void => {
		res.status(500);
	res.locals.display({ err: err.stack });
};
