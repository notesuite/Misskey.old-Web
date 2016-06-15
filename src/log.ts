import * as express from 'express';
import ipc from './log-ipc';

module.exports = (req: express.Request, res: express.Response, next: any) => {
	next();

	ipc.server.broadcast('misskey.log', {
		path: req.path
	});
};
