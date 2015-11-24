import * as express from 'express';
import * as multer from 'multer';
const upload: any = multer({ dest: 'uploads/' });

import { MisskeyExpressRequest } from '../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../misskeyExpressResponse';
import requestApi from '../utils/requestApi';
import config from '../config';

const domain: string = config.publicConfig.webApiDomain;

export default function router(app: express.Express): void {
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

	app.post(`/subdomain/${domain}/refresh-session`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
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

	app.get(`/subdomain/${domain}/web/ogp/parse`, require('./endpoints/ogp/parse').default);
	app.put(`/subdomain/${domain}/web/desktop/update-avatar`, require('./endpoints/desktop/update-avatar').default);
	app.get(`/subdomain/${domain}/web/desktop/album/open`, require('./endpoints/desktop/album/open').default);
	app.get(`/subdomain/${domain}/web/desktop/album/files`, require('./endpoints/desktop/album/files').default);
	app.post(`/subdomain/${domain}/web/desktop/album/upload`, upload.single('file'), require('./endpoints/desktop/album/upload').default);
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
