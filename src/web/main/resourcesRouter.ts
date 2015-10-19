import * as express from 'express';

import { MisskeyExpressRequest } from '../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../misskeyExpressResponse';

export default function(app: express.Express): void {
	'use strict';
	console.log('Init Web resources router');

	app.get(/^\/resources\/.*/, (req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
		// something
	});
}
