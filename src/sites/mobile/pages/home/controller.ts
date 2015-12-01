import { User } from '../../../../models/user';
import { MisskeyExpressRequest } from '../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../misskey-express-response';
import parsePostText from '../../../../utils/parse-post-text';
import requestApi from '../../../../utils/request-api';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const me: User = req.me;

	requestApi('GET', 'posts/timeline', { 'limit': 10 }, me.id).then((tl: any[]) => {
		res.display({
			timeline: tl,
			parsePostText: parsePostText
		});
	});
};
