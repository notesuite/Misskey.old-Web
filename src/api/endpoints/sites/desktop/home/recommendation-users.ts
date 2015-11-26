import * as express from 'express';
const jade: any = require('jade');
import requestApi from '../../../../../utils/requestApi';
import config from '../../../../../config';

export default function timeline(req: express.Request, res: express.Response): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../../sites/desktop/views/lib/recommendation-users/users.jade`);

	requestApi('GET', 'users/recommendations', req.query, req.user).then((users: Object[]) => {
		if (users !== null && users.length > 0) {
			res.send(compiler({
				users: users,
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
