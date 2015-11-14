import { MisskeyExpressRequest } from '../../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../../misskeyExpressResponse';
import requestApi from '../../../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	requestApi('POST', 'posts/reply', req.body, req.session.userId).then((reply: Object) => {
		res.send('kyoppie');
	});
};
