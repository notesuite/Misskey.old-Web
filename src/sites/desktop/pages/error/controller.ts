import { MisskeyExpressRequest } from '../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../misskey-express-response';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse, err: Error): void => {
	'use strict';
	res.status(500);
	res.display({ err: err.stack });
};
