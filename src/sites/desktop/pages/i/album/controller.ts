import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse, options: any = {}): void => {
	'use strict';

	res.display(req, 'i/album', {
	});
};
