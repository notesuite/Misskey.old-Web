import * as express from 'express';
import * as multer from 'multer';
const upload: any = multer({ dest: 'uploads/' });

import { MisskeyExpressRequest } from '../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../misskeyExpressResponse';
import requestApi from '../utils/requestApi';

export default function router(app: express.Express): void {
	'use strict';

	app.get('/', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			res.send(req.me.id);
		} else {
			res.send('sakuhima');
		}
	});

	app.post('/refresh-session', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			const userId: string = req.session.userId;
			requestApi('GET', 'account/show', {}, userId).then((me: Object) => {
				req.session.user = me;
				req.session.save(() => {
					res.json(me);
				});
			});
		}
	});

	app.get('/web/analyze-url', require('./endpoints/analyze-url').default);
	app.put('/web/sites/desktop/update-avatar', require('./endpoints/sites/desktop/update-avatar').default);
	app.get('/web/sites/desktop/album/open', require('./endpoints/sites/desktop/album/open').default);
	app.get('/web/sites/desktop/album/files', require('./endpoints/sites/desktop/album/files').default);
	app.post('/web/sites/desktop/album/upload',
		upload.single('file'),
		require('./endpoints/sites/desktop/album/upload').default);
	app.post('/web/sites/desktop/home/posts/reply', require('./endpoints/sites/desktop/home/posts/reply').default);
	app.get('/web/sites/desktop/home/posts/timeline', require('./endpoints/sites/desktop/home/posts/timeline').default);
	app.get('/web/sites/desktop/home/posts/talk', require('./endpoints/sites/desktop/home/posts/talk').default);
	app.get('/web/sites/desktop/home/posts/replies', require('./endpoints/sites/desktop/home/posts/replies').default);

	app.get('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('GET', req.path, req.query, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.post('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('POST', req.path, req.body, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.put('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('PUT', req.path, req.body, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.delete('*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('DELETE', req.path, req.body, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});
}
