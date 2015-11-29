import * as express from 'express';
const jade: any = require('jade');
import requestApi from '../../../../../utils/requestApi';
import config from '../../../../../config';

export default function timeline(req: express.Request, res: express.Response): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../../sites/desktop/common/views/notification/smart/items.jade`);

	requestApi('GET', 'notifications/timeline', req.query, req.user).then((tl: Object[]) => {
		if (tl !== null && tl.length > 0) {
			res.send(compiler({
				items: tl,
				me: req.user,
				config: config.publicConfig
			}));
		} else {
			res.send('');
		}
	}, (err: any) => {
		res.send(err);
	});
};
