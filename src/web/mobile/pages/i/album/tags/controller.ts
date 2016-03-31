import * as express from 'express';
import requestApi from '../../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	requestApi('album/tags/list', {}, req.user).then((tags: Object[]) => {
		res.locals.display({
			tags: tags
		}, 'i/album');
	});
};
