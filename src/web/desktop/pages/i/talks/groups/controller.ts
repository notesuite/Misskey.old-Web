import * as express from 'express';
import requestApi from '../../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	requestApi('talks/history/show', {
		type: 'group'
	}, req.user.id).then((messages: any[]) => {
		requestApi('talks/group/invitations/show', {}, req.user.id).then((invitations: any[]) => {
			res.locals.display({
				messages: messages,
				invitations: invitations
			});
		});
	});
};
