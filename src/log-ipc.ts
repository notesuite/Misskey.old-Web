const ipc = require('node-ipc');

ipc.config.id = 'misskey-web';
ipc.config.retry = 1000;
ipc.config.silent = true;

ipc.serveNet();

ipc.server.start();

export default ipc;
