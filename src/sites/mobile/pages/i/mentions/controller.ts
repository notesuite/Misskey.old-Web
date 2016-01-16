import * as express from 'express';
import requestApi from '../../../../../utils/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	requestApi('posts/mentions/show', { 'limit': 10 }, req.user).then((mentions: any[]) => {
		res.locals.display({
			mentions: mentions
		});
	});
};
