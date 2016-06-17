import * as cluster from 'cluster';
import name from './core/naming-worker-id';
import * as express from 'express';

module.exports = (req: express.Request, res: express.Response, next: any) => {
	next();

	process.send({
		ip: req.ip,
		method: req.method,
		host: req.hostname,
		path: req.path,
		ua: req.headers['user-agent'],
		date: Date.now(),
		worker: name(cluster.worker.id)
	});
};
