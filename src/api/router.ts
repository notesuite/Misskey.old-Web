import * as express from 'express';
import * as multer from 'multer';
const upload: any = multer({ dest: 'uploads/' });

import requestApi from '../core/request-api';

export default function(app: express.Express): void {
	app.use((req, res, next) => {
		res.locals.isLogin =
			req.hasOwnProperty('session') &&
			req.session !== null &&
			req.session.hasOwnProperty('userId') &&
			(<any>req.session).userId !== null;

		if (res.locals.isLogin) {
			req.user = (<any>req.session).userId;
		} else {
			req.user = null;
		}

		next();
	});

	app.get('/', (req, res) => {
		res.send('sakuhima');
	});

	app.post('/account/create', require('./endpoints/account/create').default);
	app.post('/web/url/analyze', require('./endpoints/url/analyze').default);
	app.post('/web/avatar/update', require('./endpoints/avatar/update').default);
	app.post('/web/banner/update', require('./endpoints/banner/update').default);
	app.post('/web/home-layout/update', require('./endpoints/home-layout/update').default);
	app.post('/web/display-image-quality/update', require('./endpoints/display-image-quality/update').default);
	app.post('/web/pseudo-push-notification-display-duration/update',
		require('./endpoints/pseudo-push-notification-display-duration/update').default);
	app.post('/web/ui-language/update', require('./endpoints/ui-language/update').default);
	app.post('/web/mobile-header-overlay/update', require('./endpoints/mobile-header-overlay/update').default);
	app.post('/web/user-settings/update', require('./endpoints/user-settings/update').default);
	app.post('/web/album/upload',
		upload.single('file'),
		require('./endpoints/album/upload').default);
	app.post('/web/posts/create-with-file',
		upload.single('file'),
		require('./endpoints/posts/create-with-file').default);
	app.post('/web/posts/reply', require('./endpoints/posts/reply').default);

	app.post('/*', (req, res) => {
		requestApi(
			req.path.substring(1),
			req.body,
			req.user
		).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	// Not found handling
	app.use((req, res) => {
		res.status(404).send('not-found');
	});

	// Error handling
	app.use((err: any, req: express.Request, res: express.Response, next: (err: any) => void) => {
		if (err.code === 'EBADCSRFTOKEN') {
			// handle CSRF token errors
			res.status(403);
			res.send('detected-csrf');
		} else {
			// Something
			res.status(500);
			res.send('something-happened');
		}
	});
}
