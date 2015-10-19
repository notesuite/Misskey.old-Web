import * as express from 'express';

import { MisskeyExpressRequest } from '../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../misskeyExpressResponse';

function callController(req: MisskeyExpressRequest, res: MisskeyExpressResponse, name: string, options?: any) {
	switch (req.ua) {
		case 'desktop':
			require("./sites/desktop/controllers/" + name)(req, res, options);
			break;
		case 'mobile':
			require("./sites/mobile/controllers/" + name)(req, res, options);
			break;
		default:
			require("./sites/desktop/controllers/" + name)(req, res, options);
			break;
	}
}

export default function(app: express.Express): void {
	'use strict';
	console.log('Init Web router');
	
	app.get('/', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		console.log("akari");
		if (req.isLogin) {
			callController(req, res, 'home');
		} else {
			callController(req, res, 'entrance');
		}
	});
}
