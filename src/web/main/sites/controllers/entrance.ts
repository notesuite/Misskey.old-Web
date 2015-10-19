import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';

export default function(req: MisskeyExpressRequest, res: MisskeyExpressResponse): void {
	'use strict';
	res.display(req, 'entrance');
}
