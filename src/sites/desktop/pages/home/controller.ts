import * as express from 'express';
import { User } from '../../../../models/user';
import generateLayoutedHomeWidgets from '../../common/generate-layouted-homewidgets';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	const me: User = req.user;

	generateLayoutedHomeWidgets(me, res.locals.locale, 'home').then((widgets: any) => {
		res.locals.display({
			widgets
		});
	}, (err: any) => {
		throw err;
	});
};
