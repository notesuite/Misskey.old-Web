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

	app.post('/web/analyze-url', require('./endpoints/analyze-url').default);
	app.post('/web/sites/desktop/avatar/update', require('./endpoints/sites/desktop/avatar/update').default);
	app.post('/web/sites/desktop/home-layout/upadate', require('./endpoints/sites/desktop/home-layout/update').default);
	app.post('/web/sites/desktop/album/open', require('./endpoints/sites/desktop/album/open').default);
	app.post('/web/sites/desktop/album/files', require('./endpoints/sites/desktop/album/files').default);
	app.post('/web/sites/desktop/album/upload',
		upload.single('file'),
		require('./endpoints/sites/desktop/album/upload').default);
	app.post('/web/sites/desktop/home/notifications', require('./endpoints/sites/desktop/home/notifications').default);
	app.post('/web/sites/desktop/home/recommendation-users', require('./endpoints/sites/desktop/home/recommendation-users').default);
	app.post('/web/sites/desktop/home/posts/reply', require('./endpoints/sites/desktop/home/posts/reply').default);
	app.post('/web/sites/desktop/home/posts/timeline', require('./endpoints/sites/desktop/home/posts/timeline').default);
	app.post('/web/sites/desktop/home/posts/talk', require('./endpoints/sites/desktop/home/posts/talk').default);
	app.post('/web/sites/desktop/home/posts/replies', require('./endpoints/sites/desktop/home/posts/replies').default);
	app.post('/web/sites/desktop/post/reply', require('./endpoints/sites/desktop/post/reply').default);

	app.post('*', (req: express.Request, res: express.Response) => {
		requestApi(req.path.substring(1), req.body, req.user).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});
}
