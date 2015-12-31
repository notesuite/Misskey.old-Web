import { MisskeyExpressRequest } from '../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../misskey-express-response';
import requestApi from '../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const query: string = req.query.q;

	requestApi('posts/search', {
		'query': query
	}, req.user).then((posts: any[]) => {
		res.display({
			posts: posts
		});
	});
};
