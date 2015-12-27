import { User } from '../../../../../models/user';
import { MisskeyExpressRequest } from '../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../misskey-express-response';
import generateHomeWidgets from '../../../common/generate-layouted-homewidgets';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const me: User = req.user;

	generateHomeWidgets(me, 'mentions').then((widgets: any) => {
		res.display({
			widgets
		});
	}, (err: any) => {
		throw err;
	});
};
