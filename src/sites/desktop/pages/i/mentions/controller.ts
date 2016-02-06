import * as express from 'express';
import { User } from '../../../../../models/user';
import generateHomeWidgets from '../../../common/generate-layouted-homewidgets';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	const me: User = req.user;

	generateHomeWidgets(me, res.locals.locale, 'mentions').then((widgets: any) => {
		res.locals.display({
			widgets
		}, 'home');
	}, (err: any) => {
		throw err;
	});
};
