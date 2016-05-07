import * as express from 'express';
import requestApi from '../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	requestApi('posts/mentions/show', { 'limit': 10 }, req.user).then((mentions: any[]) => {
		res.locals.display({
			mentions: mentions
		});
	});
};
