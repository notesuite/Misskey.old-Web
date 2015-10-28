import { User } from '../../../../../models/user';
import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';
import requestApi from '../../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse, options: any = {}): void => {
	'use strict';

	res.display(req, 'i/album', {
	});
};
