import * as fs from 'fs';
import * as express from 'express';
import jade from 'jade';

const config: any = require('./config');

var html: string = jade.renderFile(`${__dirname}/maintenance.jade`);

// Init express
var app: express.Express = express();
app.disable('x-powered-by');

app.all('*', (req: express.Request, res: express.Response) =>
{
    res.status(503);
    res.send(html);
});

app.listen(config.port.webHttp);
