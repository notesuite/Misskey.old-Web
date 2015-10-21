// import * as fs from 'fs';
import * as http from 'http';
import * as express from 'express';
// import * as vhost from 'vhost';
import config from './config';

const vhost: any = require('vhost');

console.log('Initializing servers');

// Init express
const app: express.Express = express();
app.disable('x-powered-by');

const server: http.Server = http.createServer(app);

// Declare servers
const mainServer: express.Express = require(`${__dirname}/web/main`).server;
const apiRelayServer: express.Express = require(`${__dirname}/api`).server;
app.use(vhost(config.publicConfig.host, mainServer));
app.use(vhost(config.publicConfig.apiHost, apiRelayServer));
// const devServer: express.Express = require(`${__dirname}/web/dev`).server;
// app.use(vhost(config.publicConfig.developerCenterHost, devServer));

app.get('/', (req: express.Request, res: express.Response) => {
	res.send('kyoppie');
});

// Listen core app
server.listen(config.port.http, () => {
	const host: string = server.address().address;
	const port: number = server.address().port;

	console.log(`>>> Misskey listening at ${host}:${port} <<<`);
});
