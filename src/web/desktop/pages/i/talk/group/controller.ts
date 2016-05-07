import * as express from 'express';
import requestApi from '../../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	const group = res.locals.talkGroup;

	requestApi('talks/messages/stream', {
		'group-id': group.id
	}, req.user.id).then((messages: any[]) => {
		res.locals.display({
			group: group,
			messages: messages.reverse()
		});
	});
};
