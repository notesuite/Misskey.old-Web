import * as express from 'express';
import requestApi from '../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	requestApi('notifications/timeline', {
		'limit': 30
	}, req.user).then((notifications: any[]) => {
		res.locals.display({
			notifications: notifications
		});
	});
};
