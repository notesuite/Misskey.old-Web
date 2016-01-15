import * as cluster from 'cluster';
import * as express from 'express';
import * as path from 'path';

import { User } from './models/user';
import { UserSettings, IUserSettings, guestUserSettings } from './models/user-settings';
import namingWorkerId from './utils/naming-worker-id';
import requestApi from './utils/request-api';
import login from './core/login';
import { MisskeyExpressRequest } from './misskey-express-request';
import { MisskeyExpressResponse } from './misskey-express-response';
import callController from './call-controller';
import config from './config';

const workerId: string = namingWorkerId(cluster.worker.id);

export default function router(app: express.Express): void {
	'use strict';

	// Init session
	app.use((req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
		// Chromeでは ALLOW-FROM をサポートしていないらしい
		// res.header('X-Frame-Options', `ALLOW-FROM ${config.publicConfig.url}`);

		(<MisskeyExpressRequest>req).isLogin =
			req.hasOwnProperty('session') &&
			req.session !== null &&
			req.session.hasOwnProperty('userId') &&
			(<any>req.session).userId !== null;

		function uatype(ua: string): string {
			'use strict';
			if (ua !== undefined && ua !== null) {
				ua = ua.toLowerCase();
				if (/(iphone|ipod|ipad|android|windows.*phone|psp|vita|nitro|nintendo)/i.test(ua)) {
					return 'mobile';
				} else {
					return 'desktop';
				}
			} else {
				return 'desktop';
			}
		}

		const ua: string = uatype(req.headers['user-agent']);
		const noui: boolean = req.query.hasOwnProperty('noui');

		req.data = {};
		req.ua = ua;
		req.renderData = {
			pagePath: req.path,
			noui: noui,
			config: config.publicConfig,
			login: req.isLogin,
			ua: ua,
			workerId: workerId
		};

		if (req.isLogin) {
			const userId: string = req.session.userId;
			requestApi('account/show', {}, userId).then((user: User) => {
				UserSettings.findOne({
					userId: userId
				}, (err: any, settings: IUserSettings) => {
					req.user = Object.assign({}, user, {_settings: settings.toObject()});
					req.renderData.me = user;
					req.renderData.userSettings = settings.toObject();
					next();
				});
			});
		} else {
			req.user = null;
			req.renderData.me = null;
			req.renderData.userSettings = guestUserSettings;
			next();
		}
	});

	app.param('userScreenName', paramUserScreenName);
	app.param('postId', paramPostId);
	app.param('talkGroupId', paramTalkGroupId);

	app.get('/', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			callController(req, res, 'home');
		} else {
			callController(req, res, 'entrance');
		}
	});

	app.post(`/subdomain/${config.publicConfig.signinDomain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		login(req.body['screen-name'], req.body['password'], req.session).then(() => {
			res.sendStatus(200);
		}, (err: any) => {
			res.sendStatus(500);
		});
	});

	app.get(`/subdomain/${config.publicConfig.signinDomain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.query.hasOwnProperty('screen-name') && req.query.hasOwnProperty('password')) {
			login(req.query['screen-name'], req.query['password'], req.session).then(() => {
				res.redirect(config.publicConfig.url);
			}, (err: any) => {
				res.sendStatus(500);
			});
		} else {
			callController(req, res, 'login');
		}
	});

	app.post(`/subdomain/${config.publicConfig.signoutDomain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.isLogin) {
			req.session.destroy(() => {
				res.redirect('/');
			});
		}
	});

	app.get('/terms-of-use', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'terms-of-use');
	});

	app.get('/welcome', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'welcome');
	});

	app.get(`/subdomain/${config.publicConfig.searchDomain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		if (req.query.hasOwnProperty('q')) {
			callController(req, res, 'search/result');
		} else {
			callController(req, res, 'search/index');
		}
	});

	app.get(`/subdomain/${config.publicConfig.shareDomain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'share');
	});

	app.get(`/subdomain/${config.publicConfig.shareDomain}/script.js`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Credentials', 'false');
		res.sendFile(path.resolve(`${__dirname}/share/script.js`));
	});

	app.get(`/subdomain/${config.publicConfig.aboutDomain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'about');
	});

	app.get(`/subdomain/${config.publicConfig.aboutDomain}/license`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'about/license');
	});

	app.get(`/subdomain/${config.publicConfig.aboutDomain}/technologies`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'about/technologies');
	});

	app.get(`/subdomain/${config.publicConfig.aboutDomain}/system`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'about/system');
	});

	app.get('/i/*', (req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
		if (req.isLogin) {
			next();
		} else {
			callController(req, res, 'login');
		}
	});

	app.get('/i/post-new', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/post-new');
	});

	app.get('/i/mentions', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/mentions');
	});

	app.get('/i/notifications', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/notifications');
	});

	app.get(`/subdomain/${config.publicConfig.talkDomain}/`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/talks');
	});

	app.get(`/subdomain/${config.publicConfig.talkDomain}/i/users`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/talks/users');
	});

	app.get(`/subdomain/${config.publicConfig.talkDomain}/i/groups`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/talks/groups');
	});

	app.get(`/subdomain/${config.publicConfig.talkDomain}/i/group/create`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/talks/group/create');
	});

	app.get(`/subdomain/${config.publicConfig.talkDomain}/:userScreenName`, (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/talk/user');
	});

	app.get(`/subdomain/${config.publicConfig.talkDomain}/\:group/:talkGroupId`,
		(req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/talk/group');
	});

	app.get('/i/album', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'i/album');
	});

	app.get('/i/settings', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/settings'));

	app.get('/i/settings/avatar', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/settings/avatar'));

	app.get('/i/settings/banner', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/settings/banner'));

	app.get('/i/settings/comment', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/settings/comment'));

	app.get('/i/settings/location', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/settings/location'));

	app.get('/i/settings/name', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/settings/name'));

	app.get('/i/settings/tags', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/settings/tags'));

	app.get('/i/settings/website', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/settings/website'));

	app.get('/i/settings/mobile-header-overlay', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/settings/mobile-header-overlay'));

	app.get('/i/home-customize', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) =>
		callController(req, res, 'i/home-customize'));

	app.get('/:userScreenName', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'user/home');
	});

	app.get('/:userScreenName/following', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'user/following');
	});

	app.get('/:userScreenName/followers', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'user/followers');
	});

	app.get('/:userScreenName/:postId', (req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		callController(req, res, 'post');
	});

	// Not found handling
	app.use((req: MisskeyExpressRequest, res: MisskeyExpressResponse) => {
		res.status(404);
		callController(req, res, 'not-found');
	});

	// Error handlings

	app.use((err: any, req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: (err: any) => void) => {
		if (err.code !== 'EBADCSRFTOKEN') {
			return next(err);
		}

		// handle CSRF token errors
		res.status(403);
		res.send('form tampered with');
	});

	app.use((err: any, req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
		console.error(err);
		callController(req, res, 'error', err);
	});
}

function paramUserScreenName(
	req: MisskeyExpressRequest,
	res: MisskeyExpressResponse,
	next: () => void,
	screenName: string
): void {
	'use strict';

	requestApi('users/show', {
		'screen-name': screenName
	}, req.isLogin ? req.user : null).then((user: User) => {
		if (user !== null) {
			req.data.user = user;
			UserSettings.findOne({
				userId: user.id
			}, (settingsFindErr: any, settings: IUserSettings) => {
				if (settingsFindErr !== null) {
					throw settingsFindErr;
				}
				req.data.userSettings = settings;
				next();
			});
		} else {
			res.status(404);
			callController(req, res, 'user-not-found');
		}
	}, (err: any) => {
		if (err.body === 'not-found') {
			res.status(404);
			callController(req, res, 'user-not-found');
		}
	});
}

function paramPostId(
	req: MisskeyExpressRequest,
	res: MisskeyExpressResponse,
	next: () => void,
	postId: string
): void {
	'use strict';

	requestApi('posts/show', {
		'post-id': postId
	}, req.isLogin ? req.user : null).then((post: Object) => {
		if (post !== null) {
			req.data.post = post;
			next();
		} else {
			res.status(404);
			callController(req, res, 'post-not-found');
		}
	}, (err: any) => {
		if (err.body === 'not-found') {
			res.status(404);
			callController(req, res, 'post-not-found');
		}
	});
}

function paramTalkGroupId(
	req: MisskeyExpressRequest,
	res: MisskeyExpressResponse,
	next: () => void,
	groupId: string
): void {
	'use strict';

	requestApi('talks/group/show', {
		'group-id': groupId
	}, req.user).then((group: Object) => {
		req.data.talkGroup = group;
		next();
	}, (err: any) => {
		res.sendStatus(500);
	});
}
