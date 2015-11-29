import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse, err: Error): void => {
	'use strict';
	res.status(500);
	res.display({ err: err.stack });
};
