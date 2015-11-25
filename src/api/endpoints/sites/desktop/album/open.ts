import * as express from 'express';
const jade: any = require('jade');

import config from '../../../../../config';

export default function open(req: express.Request, res: express.Response): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../../sites/desktop/views/common/album.jade`);

	const browser: string = compiler({
		me: req.user,
		config: config.publicConfig
	});

	res.send(browser);
};
