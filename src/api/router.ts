import * as express from 'express';
import * as multer from 'multer';
const upload: any = multer({ dest: 'uploads/' });

import { MisskeyExpressRequest } from '../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../misskeyExpressResponse';
import requestApi from '../utils/requestApi';
import config from '../config';

const domain: string = config.publicConfig.webApiDomain;

export default function(app: express.Express): void {
	'use strict';

	// APIのレスポンスはキャッシュさせない
	app.all(`/subdomain/${domain}/*`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
		res.set({
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0'
		});
		next();
	});

	app.get(`/subdomain/${domain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			res.send(req.me.id);
		} else {
			res.send('sakuhima');
		}
	});

	app.get(`/subdomain/${domain}/web/ogp/parse`, require('./endpoints/ogp/parse'));
	app.put(`/subdomain/${domain}/web/desktop/update-icon`, require('./endpoints/desktop/update-icon'));
	app.get(`/subdomain/${domain}/web/desktop/album/open`, require('./endpoints/desktop/album/open'));
	app.get(`/subdomain/${domain}/web/desktop/album/files`, require('./endpoints/desktop/album/files'));
	app.post(`/subdomain/${domain}/web/desktop/album/upload`, upload.single('file'), require('./endpoints/desktop/album/upload'));
	app.post(`/subdomain/${domain}/web/desktop/home/posts/reply`, require('./endpoints/desktop/home/posts/reply').default);
	app.get(`/subdomain/${domain}/web/desktop/home/posts/timeline`, require('./endpoints/desktop/home/posts/timeline').default);
	app.get(`/subdomain/${domain}/web/desktop/home/posts/talk`, require('./endpoints/desktop/home/posts/talk').default);
	app.get(`/subdomain/${domain}/web/desktop/home/posts/replies`, require('./endpoints/desktop/home/posts/replies').default);

	app.get(`/subdomain/${domain}/*`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('GET', req.path.replace(`/subdomain/${domain}/`, ''), req.query, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.post(`/subdomain/${domain}/*`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('POST', req.path.replace(`/subdomain/${domain}/`, ''), req.body, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.put(`/subdomain/${domain}/*`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('PUT', req.path.replace(`/subdomain/${domain}/`, ''), req.body, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.delete(`/subdomain/${domain}/*`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('DELETE', req.path.replace(`/subdomain/${domain}/`, ''), req.body, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});
}
