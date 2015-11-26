import * as express from 'express';
import * as multer from 'multer';
const upload: any = multer({ dest: 'uploads/' });

import requestApi from '../utils/requestApi';

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
			requestApi('GET', 'account/show', {}, userId).then((me: Object) => {
				(<any>req.session).user = me;
				req.session.save(() => {
					res.json(me);
				});
			});
		}
	});

	app.get('/web/analyze-url', require('./endpoints/analyze-url').default);
	app.put('/web/sites/desktop/update-avatar', require('./endpoints/sites/desktop/update-avatar').default);
	app.put('/web/sites/desktop/update-home-layout', require('./endpoints/sites/desktop/update-home-layout').default);
	app.get('/web/sites/desktop/album/open', require('./endpoints/sites/desktop/album/open').default);
	app.get('/web/sites/desktop/album/files', require('./endpoints/sites/desktop/album/files').default);
	app.post('/web/sites/desktop/album/upload',
		upload.single('file'),
		require('./endpoints/sites/desktop/album/upload').default);
	app.get('/web/sites/desktop/home/notifications', require('./endpoints/sites/desktop/home/notifications').default);
	app.get('/web/sites/desktop/home/recommendation-users', require('./endpoints/sites/desktop/home/recommendation-users').default);
	app.post('/web/sites/desktop/home/posts/reply', require('./endpoints/sites/desktop/home/posts/reply').default);
	app.get('/web/sites/desktop/home/posts/timeline', require('./endpoints/sites/desktop/home/posts/timeline').default);
	app.get('/web/sites/desktop/home/posts/talk', require('./endpoints/sites/desktop/home/posts/talk').default);
	app.get('/web/sites/desktop/home/posts/replies', require('./endpoints/sites/desktop/home/posts/replies').default);
	app.post('/web/sites/desktop/post/reply', require('./endpoints/sites/desktop/post/reply').default);

	app.get('*', (req: express.Request, res: express.Response) => {
		requestApi('GET', req.path.substring(1), req.query, req.user).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.post('*', (req: express.Request, res: express.Response) => {
		requestApi('POST', req.path.substring(1), req.body, req.user).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.put('*', (req: express.Request, res: express.Response) => {
		requestApi('PUT', req.path.substring(1), req.body, req.user).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.delete('*', (req: express.Request, res: express.Response) => {
		requestApi('DELETE', req.path.substring(1), req.body, req.user).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});
}
