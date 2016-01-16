import * as express from 'express';
import requestApi from '../../../../../../utils/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	requestApi('talks/history/show', {
		type: 'user'
	}, req.user.id).then((messages: any[]) => {
		res.locals.display({
			messages: messages
		});
	});
};
