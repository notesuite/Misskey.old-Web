import * as express from 'express';

import { MisskeyExpressRequest } from '../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../misskeyExpressResponse';

import requestApi from '../utils/requestApi';

export default function(app: express.Express): void {
	'use strict';
	console.log('Init Web API relay server router');

	app.get('/', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			res.send(req.session.userId);
		} else {
			res.send('sakuhima');
		}
	});

	app.get('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi("GET", req.path, req.query, userId).then((response: any) => {
			res.send(response);
		});
	});
}
