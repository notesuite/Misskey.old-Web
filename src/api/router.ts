import * as express from 'express';
import * as multer from 'multer';
const upload: any = multer({ dest: 'uploads/' });

import requestApi from '../utils/request-api';

export default function router(app: express.Express): void {
	'use strict';

	app.get('/', (req: express.Request, res: express.Response) => {
		if (req.user !== null) {
			res.send(req.user.id);
		} else {
			res.send('sakuhima');
		}
	});

	app.post('/web/refresh-session', (req: express.Request, res: express.Response) => {
		if (req.user !== null) {
			const userId: string = (<any>req.session).userId;
			requestApi('account/show', {}, userId).then((me: Object) => {
				(<any>req.session).user = me;
				req.session.save(() => {
					res.json(me);
				});
			});
		}
	});

	app.post('/web/url/analyze', require('./endpoints/url/analyze').default);
	app.post('/web/avatar/update', require('./endpoints/avatar/update').default);
	app.post('/web/home-layout/update', require('./endpoints/home-layout/update').default);
	app.post('/web/album/upload',
		upload.single('file'),
		require('./endpoints/album/upload').default);
	app.post('/web/posts/create-with-file',
		upload.single('file'),
		require('./endpoints/posts/create-with-file').default);
	app.post('/web/posts/reply', require('./endpoints/posts/reply').default);

	app.post('*', (req: express.Request, res: express.Response) => {
		requestApi(req.path.substring(1), req.body, req.user).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});
}
