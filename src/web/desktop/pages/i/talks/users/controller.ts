import * as express from 'express';
import requestApi from '../../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	
	requestApi('talks/history/show', {
		type: 'user'
	}, req.user.id).then((messages: any[]) => {
		res.locals.display({
			messages: messages
		});
	});
};
