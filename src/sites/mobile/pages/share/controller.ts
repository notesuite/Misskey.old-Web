import { MisskeyExpressRequest } from '../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../misskey-express-response';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	res.display({
		title: req.query.title,
		url: req.query.url,
	});
};
