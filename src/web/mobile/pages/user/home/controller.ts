import * as express from 'express';
import requestApi from '../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	requestApi('posts/user-timeline', {
		'user-id': res.locals.user.id,
		'limit': 10
	}, req.user).then((timeline: any[]) => {
		res.locals.display({
			user: res.locals.user,
			timeline: timeline
		});
	});
};
