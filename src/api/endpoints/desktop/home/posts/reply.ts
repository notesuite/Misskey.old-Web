import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';
import requestApi from '../../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	const photos: string = req.body['photos'];
	if (photos !== undefined && photos !== null) {
		requestApi('POST', 'posts/photo', req.body, req.session.userId).then((reply: Object) => {
			res.send('kyoppie');
		});
	} else {
		requestApi('POST', 'posts/status', req.body, req.session.userId).then((reply: Object) => {
			res.send('kyoppie');
		});
	}
};
