import { User } from '../../../../models/user';
import { MisskeyExpressRequest } from '../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../misskey-express-response';
import generateLayoutedHomeWidgets from '../../common/generate-layouted-homewidgets';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const me: User = req.me;

	generateLayoutedHomeWidgets(me, 'home').then((widgets: any) => {
		res.display({
			widgets
		});
	}, (err: any) => {
		throw err;
	});
};
