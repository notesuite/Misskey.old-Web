import * as express from 'express';
import { User } from '../../../../db/models/user';
import requestApi from '../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	
	const me: User = req.user;

	requestApi('posts/timeline', { 'limit': 10 }, me).then((tl: any[]) => {
		res.locals.display({
			timeline: tl
		});
	});
};
