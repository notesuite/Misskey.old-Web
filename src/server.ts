import * as fs from 'fs';
import * as http from 'http';
import * as express from 'express';
// import * as vhost from 'vhost';
import jade from 'jade';

const config: any = require('./config');
const vhost: any = require('vhost');

console.log('Servers loader loaded');

// Init express
var app: express.Express = express();
app.disable('x-powered-by');

var server: http.Server = http.createServer(app);

// Define servers
var mainServer = require(`${__dirname}/web/main`).server;
var devServer = require(`${__dirname}/web/dev`).server;
app.use(vhost('misskey.xyz', mainServer));
app.use(vhost('dev.misskey.xyz', devServer));

// Listen core app
server.listen(config.port.webHttp);
