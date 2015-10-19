import * as express from 'express';

import { MisskeyExpressRequest } from '../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../misskeyExpressResponse';

function callController(req: MisskeyExpressRequest, res: MisskeyExpressResponse, name: string, options?: any): void {
	'use strict';
	const controller: (req: MisskeyExpressRequest, res: MisskeyExpressResponse, options: any) => void
		= ((): (req: MisskeyExpressRequest, res: MisskeyExpressResponse, options: any) => void => {
			switch (req.ua) {
				case 'desktop':
					return require(`./sites/desktop/controllers/${name}`);
				case 'mobile':
					return require(`./sites/mobile/controllers/${name}`);
				default:
					return require(`./sites/desktop/controllers/${name}`);
			}
		})();
	controller(req, res, options);
}

export default function(app: express.Express): void {
	'use strict';
	console.log('Init Web router');

	app.get('/', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			callController(req, res, 'home');
		} else {
			callController(req, res, 'entrance');
		}
	});
}
