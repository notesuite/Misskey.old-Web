import * as express from 'express';
import ipc from './log-ipc';

module.exports = (req: express.Request, res: express.Response, next: any) => {
	next();

	ipc.server.broadcast('misskey.log', {
		ip: req.ip,
		method: req.method,
		host: req.hostname,
		path: req.path,
		ua: req.headers['user-agent'],
		date: Date.now()
	});
};
