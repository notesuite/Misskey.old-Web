import * as express from 'express';
import * as multer from 'multer';
const upload: any = multer({ dest: 'uploads/' });

import requestApi from '../utils/request-api';
import refresh from '../core/refresh-session';
import config from '../config';

export default function router(app: express.Express): void {
	'use strict';

	app.get(`/subdomain/${config.publicConfig.webApiDomain}/`, (req: express.Request, res: express.Response) => {
		if (req.user !== null) {
			res.send(req.user.id);
		} else {
			res.send('sakuhima');
		}
	});

	app.post(`/subdomain/${config.publicConfig.webApiDomain}/web/refresh-session`, (req: express.Request, res: express.Response) => {
		if (req.user !== null) {
			refresh(req.session).then(() => {
				res.sendStatus(200);
			});
		}
	});

	app.post(`/subdomain/${config.publicConfig.webApiDomain}/web/url/analyze`, require('./endpoints/url/analyze').default);
	app.post(`/subdomain/${config.publicConfig.webApiDomain}/web/avatar/update`, require('./endpoints/avatar/update').default);
	app.post(`/subdomain/${config.publicConfig.webApiDomain}/web/banner/update`, require('./endpoints/banner/update').default);
	app.post(`/subdomain/${config.publicConfig.webApiDomain}/web/home-layout/update`, require('./endpoints/home-layout/update').default);
	app.post(`/subdomain/${config.publicConfig.webApiDomain}/web/user-settings/update`, require('./endpoints/user-settings/update').default);
	app.post(`/subdomain/${config.publicConfig.webApiDomain}/web/album/upload`,
		upload.single('file'),
		require('./endpoints/album/upload').default);
	app.post(`/subdomain/${config.publicConfig.webApiDomain}/web/posts/create-with-file`,
		upload.single('file'),
		require('./endpoints/posts/create-with-file').default);
	app.post(`/subdomain/${config.publicConfig.webApiDomain}/web/posts/reply`, require('./endpoints/posts/reply').default);

	app.post(`/subdomain/${config.publicConfig.webApiDomain}/*`, (req: express.Request, res: express.Response) => {
		requestApi(req.path.substring(`/subdomain/${config.publicConfig.webApiDomain}/`.length), req.body, req.user).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});
}
