import * as express from 'express';

import {User} from '../models/user';
import requestApi from '../utils/requestApi';
import { MisskeyExpressRequest } from '../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../misskeyExpressResponse';

function callController(req: MisskeyExpressRequest, res: MisskeyExpressResponse, name: string, options?: any): void {
	'use strict';
	const controller: (req: MisskeyExpressRequest, res: MisskeyExpressResponse, options: any) => void
		= ((): (req: MisskeyExpressRequest, res: MisskeyExpressResponse, options: any) => void => {
			switch (req.ua) {
				case 'desktop':
					return require(`./sites/desktop/controllers/${name}`);
				case 'mobile':
					return require(`./sites/mobile/controllers/${name}`);
				default:
					return require(`./sites/desktop/controllers/${name}`);
			}
		})();
	controller(req, res, options);
}

export default function(app: express.Express): void {
	'use strict';
	console.log('Init Web router');
	
	app.param('userScreenName', (req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void, screenName: string) => {
		requestApi('GET', 'users/show', {
			screenNameLower: screenName.toLowerCase()
		}).then((user: User) => {
			if (user !== null) {
				req.rootUser = user;
				next();
			} else {
				res.status(404);
				res.display(req, res, 'user-not-found', {});
			}
		});
	});

	app.get('/', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			callController(req, res, 'home');
		} else {
			callController(req, res, 'entrance');
		}
	});
	
	app.get('/i/*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
		if (req.isLogin) {
			next();
		} else {
			callController(req, res, 'login');
		}
	});

	app.get('/i/album', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/album');
	});
	
	app.get('/i/settings', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => callController(req, res, 'i/settings'));

	app.post('/login', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		requestApi("GET", 'login', req.body).then((response: any) => {
			const user: User = response.user;
			req.session.userId = user.id;
			req.session.save(() => {
				res.json(response);
			});
		});
	});
	
	app.get('/:userScreenName', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'user');
	});
}
