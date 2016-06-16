import * as cluster from 'cluster';
const ipc = require('node-ipc');

ipc.config.id = 'misskey-web';
ipc.config.retry = 1000;
ipc.config.silent = true;

ipc.serve();

ipc.server.start();

// Listen new workers
cluster.on('fork', worker => {
	worker.on('message', (msg: any) => {
		ipc.server.broadcast('misskey.log', msg);
	});
});
