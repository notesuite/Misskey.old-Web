import { User } from '../../../models/user';
import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';
import parsePostText from '../../../utils/parsePostText';
import requestApi from '../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const me: User = req.me;
	
	requestApi('GET', 'posts/timeline', { 'limit': 10 }, me.id).then((tl: any[]) => {
		res.display(req, 'home', {
			timeline: tl
		});
	});
};
