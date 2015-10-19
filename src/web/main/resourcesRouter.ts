import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as less from 'less';

import { User } from '../../models/user';
import { MisskeyExpressRequest } from '../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../misskeyExpressResponse';
import requestApi from '../../utils/requestApi';

import config from '../../config';

export default function(app: express.Express): void {
	'use strict';
	console.log('Init Web resources router');

	app.get(/^\/resources\/common\/.*/, (req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
		const resourcePath: string = path.resolve(`${__dirname}/${req.path}`);
		if (fs.existsSync(resourcePath)) {
			res.sendFile(resourcePath);
		} else {
			res.status(404);
			res.send('not found');
		}
	});

	app.get(/^\/resources\/.*/, (req: MisskeyExpressRequest, res: MisskeyExpressResponse, next: () => void) => {
		if (req.path.indexOf('..') > -1) {
			res.status(400);
			res.send('invalid path');
		} else {
			if (/\.css$/.exec(req.path)) {
				const cssPath: string = path.resolve(`${__dirname}/sites/${req.ua}/${req.path}`);
				const lessPath: string = path.resolve(`${__dirname}/sites/${req.ua}/${req.path.replace(/\.css$/, '.less')}`);
				if (fs.existsSync(lessPath)) {
					if (req.query.hasOwnProperty('user')) {
						requestApi("GET", "users/show", { "screen-name": req.query.user }).then((user: User) => {
							readFileSendLess(req, res, lessPath, user);
						});
					} else {
						readFileSendLess(req, res, lessPath, req.isLogin ? req.me : null);
					}
				} else if (fs.existsSync(cssPath)) {
					res.sendFile(cssPath);
				}
			} else {
				next();
			}
		}
	});
}

function readFileSendLess(req: MisskeyExpressRequest, res: MisskeyExpressResponse, path: string, styleUser: User): void {
	'use strict';
	fs.readFile(path, 'utf8', (err: NodeJS.ErrnoException, lessCss: string) => {
		compileLess(lessCss, styleUser, (css: string) => {
			res.header('Content-type', 'text/css');
			res.send(css);
		});
	});
}

function compileLess(lessCss: string, styleUser: User, callback: (css: string) => void): void {
	'use strict';
	const color: string = styleUser !== null && /^#[a-fA-F0-9]{6}$/.exec(styleUser.color)
		? styleUser.color
		: config.publicConfig.themeColor;
	less.render(preCompile(), null, (err: Less.RenderError, output: Less.RenderOutput) => {
		if (err) {
			throw err;
		} else {
			callback(output.css);
		}
	});

	function preCompile(): string {
		'use strict';
		return lessCss.replace(/<%themeColor%>/g, color);
	}
}
