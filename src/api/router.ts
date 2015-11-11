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

	app.get('/album-browser/album/files', require('./endpoints/album-browser/album/files'));

	app.post('/album-browser/album/upload', require('./endpoints/album-browser/album/upload'));

	app.post('/home/post/reply', require('./endpoints/home/post/reply'));

	app.get('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('GET', req.path.substring(1), req.query, userId).then((response: any) => {
			res.json(response);
		});
	});

	app.post('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('POST', req.path.substring(1), req.body, userId).then((response: any) => {
			res.json(response);
		});
	});
	
	app.put('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('PUT', req.path.substring(1), req.body, userId).then((response: any) => {
			res.json(response);
		});
	});
	
	app.delete('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('DELETE', req.path.substring(1), req.body, userId).then((response: any) => {
			res.json(response);
		});
	});
}
