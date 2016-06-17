import * as os from 'os';
import * as cluster from 'cluster';
const ipc = require('node-ipc');

const getInfo = () => {
	return {
		machine: os.hostname(),
		pid: process.pid,
		uptime: process.uptime()
	};
};

ipc.config.id = 'misskey-web';
ipc.config.retry = 1000;
ipc.config.silent = true;

ipc.serve(() => {
	ipc.server.on('connect', (socket: any) => {
		ipc.server.emit(socket, 'misskey.info', getInfo());
	});
});

ipc.server.start();

// Listen new workers
cluster.on('fork', worker => {
	worker.on('message', (msg: any) => {
		ipc.server.broadcast('misskey.log', msg);
	});
});

setInterval(() => {
	ipc.server.broadcast('misskey.info', getInfo());
}, 1000);
