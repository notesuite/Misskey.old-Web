import * as express from 'express';

import { MisskeyExpressRequest } from '../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../misskeyExpressResponse';
import config from '../../config';

export default function(app: express.Express): void {
	'use strict';
	console.log('Init Web API server router');

	app.get(`/subdomain/${config.publicConfig.webApiDomain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			res.send(req.me.id);
		} else {
			res.send('sakuhima');
		}
	});

	app.get('/ogp/parse', require('./endpoints/ogp/parse'));
	app.get('/desktop/album/open', require('./endpoints/desktop/album/open'));
	app.get('/desktop/album/files', require('./endpoints/desktop/album/files'));
	app.post('/desktop/album/upload', require('./endpoints/desktop/album/upload'));
	app.post('/desktop/home/posts/reply', require('./endpoints/desktop/home/posts/reply'));
}
