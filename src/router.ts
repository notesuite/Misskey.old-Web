//////////////////////////////////////////////////
// WEB ROUTER
//////////////////////////////////////////////////

import * as express from 'express';
import * as path from 'path';

import { User } from './db/models/user';
import requestApi from './core/request-api';
import login from './core/login';
import callController from './call-controller';
import config from './config';

export default function router(app: express.Express): void {

	app.param('userScreenName', paramUserScreenName);
	app.param('postId', paramPostId);
	app.param('fileId', paramFileId);
	app.param('folderId', paramFolderId);
	app.param('talkGroupId', paramTalkGroupId);

	app.get('/', (req, res) => {
		if (res.locals.isLogin) {
			callController(req, res, 'home');
		} else {
			callController(req, res, 'entrance');
		}
	});

	//////////////////////////////////////////////////
	// GENERAL

	app.get('/terms-of-use', (req, res) => {
		callController(req, res, 'terms-of-use');
	});

	//////////////////////////////////////////////////
	// I

	app.get('/i/*', (req, res, next) => {
		if (res.locals.isLogin) {
			next();
		} else {
			callController(req, res, 'login');
		}
	});

	app.get('/i/post', (req, res) => {
		callController(req, res, 'i/post');
	});

	app.get('/i/mentions', (req, res) => {
		callController(req, res, 'i/mentions');
	});

	app.get('/i/notifications', (req, res) => {
		callController(req, res, 'i/notifications');
	});

	app.get('/i/album', (req, res) => {
		callController(req, res, 'i/album');
	});

	app.get('/i/album/file/:fileId', (req, res) => {
		callController(req, res, 'i/album/file');
	});

	app.get('/i/album/file/:fileId/edit-tag', (req, res) => {
		callController(req, res, 'i/album/file/edit-tag');
	});

	app.get('/i/album/folder/:folderId', (req, res) => {
		callController(req, res, 'i/album/folder');
	});

	app.get('/i/album/tags', (req, res) => {
		callController(req, res, 'i/album/tags');
	});

	app.get('/i/upload', (req, res) => {
		callController(req, res, 'i/upload');
	});

	app.get('/i/settings', (req, res) =>
		callController(req, res, 'i/settings'));

	app.get('/i/settings/avatar', (req, res) =>
		callController(req, res, 'i/settings/avatar'));

	app.get('/i/settings/banner', (req, res) =>
		callController(req, res, 'i/settings/banner'));

	app.get('/i/settings/comment', (req, res) =>
		callController(req, res, 'i/settings/comment'));

	app.get('/i/settings/location', (req, res) =>
		callController(req, res, 'i/settings/location'));

	app.get('/i/settings/name', (req, res) =>
		callController(req, res, 'i/settings/name'));

	app.get('/i/settings/tags', (req, res) =>
		callController(req, res, 'i/settings/tags'));

	app.get('/i/settings/website', (req, res) =>
		callController(req, res, 'i/settings/website'));

	app.get('/i/settings/ui-language', (req, res) =>
		callController(req, res, 'i/settings/ui-language'));

	app.get('/i/settings/display-image-quality', (req, res) =>
		callController(req, res, 'i/settings/display-image-quality'));

	app.get('/i/settings/push-notification', (req, res) =>
		callController(req, res, 'i/settings/push-notification'));

	app.get('/i/settings/mobile-header-overlay', (req, res) =>
		callController(req, res, 'i/settings/mobile-header-overlay'));

	app.get('/i/home-customize', (req, res) =>
		callController(req, res, 'i/home-customize'));

	//////////////////////////////////////////////////
	// COLOR

	const colorDomain = `/subdomain/${config.domains.color}`;

	app.get(`${colorDomain}/`, (req, res) => {
		callController(req, res, 'color');
	});

	//////////////////////////////////////////////////
	// SIGNUP

	const signupDomain = `/subdomain/${config.domains.signup}`;

	app.get(`${signupDomain}/`, (req, res) => {
		if (res.locals.isLogin) {
			res.redirect(config.url);
		} else {
			callController(req, res, 'signup');
		}
	});

	//////////////////////////////////////////////////
	// SIGNIN

	const signinDomain = `/subdomain/${config.domains.signin}`;

	app.post(`${signinDomain}/`, (req, res) => {
		login(req.body['screen-name'], req.body['password'], req.session).then(() => {
			res.sendStatus(200);
		}, (err: any) => {
			res.status(err.statusCode).send(err.body);
		});
	});

	app.get(`${signinDomain}/`, (req, res) => {
		if (res.locals.isLogin) {
			res.redirect(config.url);
		} else if (req.query.hasOwnProperty('screen-name') && req.query.hasOwnProperty('password')) {
			login(req.query['screen-name'], req.query['password'], req.session).then(() => {
				res.redirect(config.url);
			}, (err: any) => {
				res.status(err.statusCode).send(err.body);
			});
		} else {
			callController(req, res, 'login');
		}
	});

	//////////////////////////////////////////////////
	// SIGNOUT

	const signoutDomain = `/subdomain/${config.domains.signout}`;

	app.get(`${signoutDomain}/`, (req, res) => {
		if (res.locals.isLogin) {
			req.session.destroy(() => {
				res.redirect(config.url);
			});
		} else {
			res.redirect(config.url);
		}
	});

	//////////////////////////////////////////////////
	// SEARCH

	const searchDomain = `/subdomain/${config.domains.search}`;

	app.get(`${searchDomain}/`, (req, res) => {
		if (req.query.hasOwnProperty('q')) {
			callController(req, res, 'search/result');
		} else {
			callController(req, res, 'search/index');
		}
	});

	//////////////////////////////////////////////////
	// SHARE

	const shareDomain = `/subdomain/${config.domains.share}`;

	app.get(`${shareDomain}/`, (req, res) => {
		callController(req, res, 'share');
	});

	app.get(`${shareDomain}/script.js`, (req, res) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Credentials', 'false');
		res.sendFile(path.resolve(`${__dirname}/share/script.js`));
	});

	//////////////////////////////////////////////////
	// ABOUT

	const aboutDomain = `/subdomain/${config.domains.about}`;

	app.get(`${aboutDomain}/`, (req, res) => {
		callController(req, res, 'about');
	});

	app.get(`${aboutDomain}/license`, (req, res) => {
		callController(req, res, 'about/license');
	});

	app.get(`${aboutDomain}/technologies`, (req, res) => {
		callController(req, res, 'about/technologies');
	});

	//////////////////////////////////////////////////
	// TALK

	const talkDomain = `/subdomain/${config.domains.talk}`;

	app.get(`${talkDomain}/*`, (req, res, next) => {
		if (req.headers.hasOwnProperty('referer')) {
			const referer = req.headers['referer'];
			if ((new RegExp(`^https?://(.+\.)?${config.host}/?\$`)).test(referer)) {
				res.header('X-Frame-Options', '');
			} else {
				res.header('X-Frame-Options', 'DENY');
			}
		} else {
			res.header('X-Frame-Options', 'DENY');
		}

		next();
	});

	app.get(`${talkDomain}/`, (req, res) => {
		callController(req, res, 'i/talks');
	});

	app.get(`${talkDomain}/i/users`, (req, res) => {
		callController(req, res, 'i/talks/users');
	});

	app.get(`${talkDomain}/i/groups`, (req, res) => {
		callController(req, res, 'i/talks/groups');
	});

	app.get(`${talkDomain}/i/group/create`, (req, res) => {
		callController(req, res, 'i/talks/group/create');
	});

	app.get(`${talkDomain}/:userScreenName`, (req, res) => {
		callController(req, res, 'i/talk/user');
	});

	app.get(`${talkDomain}/\:group/:talkGroupId`,
		(req, res) => {
		callController(req, res, 'i/talk/group');
	});

	//////////////////////////////////////////////////
	// FORUM

	const forumDomain = `/subdomain/${config.domains.forum}`;

	app.get(`${forumDomain}/`, (req, res) => {
		callController(req, res, 'forum');
	});

	app.get('/:userScreenName', (req, res) => {
		callController(req, res, 'user/home');
	});

	app.get('/:userScreenName/following', (req, res) => {
		callController(req, res, 'user/following');
	});

	app.get('/:userScreenName/followers', (req, res) => {
		callController(req, res, 'user/followers');
	});

	app.get('/:userScreenName/:postId', (req, res) => {
		callController(req, res, 'post');
	});

	// Not found handling
	app.use((req, res) => {
		res.status(404);
		callController(req, res, 'not-found');
	});

	// Error handlings

	app.use((err: any, req: express.Request, res: express.Response, next: (err: any) => void) => {
		if (err.code !== 'EBADCSRFTOKEN') {
			return next(err);
		}

		// handle CSRF token errors
		res.status(403);
		res.send('form tampered with');
	});

	app.use((err: any, req: express.Request, res: express.Response, next: () => void) => {
		console.error(err);
		callController(req, res, 'error', err);
	});
}

function paramUserScreenName(
	req: express.Request,
	res: express.Response,
	next: () => void,
	screenName: string
): void {

	requestApi('users/show', {
		'screen-name': screenName
	}, res.locals.isLogin ? req.user : null).then((user: User) => {
		if (user !== null) {
			res.locals.user = user;
			next();
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
	req: express.Request,
	res: express.Response,
	next: () => void,
	postId: string
): void {

	requestApi('posts/show', {
		'post-id': postId
	}, res.locals.isLogin ? req.user : null).then((post: Object) => {
		if (post !== null) {
			res.locals.post = post;
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

function paramFileId(
	req: express.Request,
	res: express.Response,
	next: () => void,
	fileId: string
): void {

	requestApi('album/files/show', {
		'file-id': fileId
	}, res.locals.isLogin ? req.user : null).then((file: Object) => {
		res.locals.file = file;
		next();
	}, (err: any) => {
		if (err.body === 'not-found') {
			res.status(404);
			callController(req, res, 'i/album/file-not-found');
		}
	});
}

function paramFolderId(
	req: express.Request,
	res: express.Response,
	next: () => void,
	folderId: string
): void {

	requestApi('album/folders/show', {
		'folder-id': folderId
	}, res.locals.isLogin ? req.user : null).then((folder: Object) => {
		res.locals.folder = folder;
		next();
	}, (err: any) => {
		if (err.body === 'not-found') {
			res.status(404);
			callController(req, res, 'i/album/folder-not-found');
		}
	});
}

function paramTalkGroupId(
	req: express.Request,
	res: express.Response,
	next: () => void,
	groupId: string
): void {

	requestApi('talks/group/show', {
		'group-id': groupId
	}, req.user).then((group: Object) => {
		res.locals.talkGroup = group;
		next();
	}, (err: any) => {
		res.sendStatus(500);
	});
}
