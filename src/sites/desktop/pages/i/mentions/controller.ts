import { User } from '../../../../models/user';
import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
import generateHomeWidgets from '../../utils/generate-layouted-homewidgets';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const me: User = req.me;

	generateHomeWidgets(me, 'mentions').then((widgets: any) => {
		res.display(req, 'home', {
			widgets
		});
	}, (err: any) => {
		console.error(err);
		res.display(req, 'error', {err});
	});
};
