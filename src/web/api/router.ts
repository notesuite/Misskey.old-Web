import * as express from 'express';

import { MisskeyExpressRequest } from '../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../misskeyExpressResponse';
import requestApi from '../../utils/requestApi';
import config from '../../config';

const domain: string = config.publicConfig.webApiDomain;

export default function(app: express.Express): void {
	'use strict';
	console.log('Init Web API server router');

	app.get(`/subdomain/${domain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			res.send(req.me.id);
		} else {
			res.send('sakuhima');
		}
	});

	app.get(`/subdomain/${domain}/web/ogp/parse`, require('./endpoints/ogp/parse'));
	app.get(`/subdomain/${domain}/web/desktop/album/open`, require('./endpoints/desktop/album/open'));
	app.get(`/subdomain/${domain}/web/desktop/album/files`, require('./endpoints/desktop/album/files'));
	app.post(`/subdomain/${domain}/web/desktop/album/upload`, require('./endpoints/desktop/album/upload'));
	app.post(`/subdomain/${domain}/web/desktop/home/posts/reply`, require('./endpoints/desktop/home/posts/reply'));
	
	app.get(`/subdomain/${domain}/*`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('GET', req.path.substring(1), req.query, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.post(`/subdomain/${domain}/*`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('POST', req.path.substring(1), req.body, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.put(`/subdomain/${domain}/*`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('PUT', req.path.substring(1), req.body, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});

	app.delete(`/subdomain/${domain}/*`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		const userId: string = req.isLogin ? req.session.userId : null;
		requestApi('DELETE', req.path.substring(1), req.body, userId).then((response: any) => {
			res.json(response);
		}, (err: any) => {
			res.status(err.statusCode);
			res.send(err.body);
		});
	});
}
