import * as express from 'express';
import config from '../../config';

export default function ee(req: express.Request, res: express.Response, q: string): void {
	'use strict';

	switch (q.trim()) {
		case '$flipx':
			setEEcookie('ee-flipx', '1');
			break;
		case '$flipy':
			setEEcookie('ee-flipy', '1');
			break;
		case '$skew':
			setEEcookie('ee-skew', '1');
			break;
		case '$grayscale':
			setEEcookie('ee-grayscale', '1');
			break;
		case '$sepia':
			setEEcookie('ee-sepia', '1');
			break;
		case '$saturate':
			setEEcookie('ee-saturate', '1');
			break;
		case '$invert':
			setEEcookie('ee-invert', '1');
			break;
		default:
			break;
	}

	function setEEcookie(name: string, value: string): void {
		'use strict';
		const age = 1000 * 60 * 5;
		clearCookie('ee-flipx');
		clearCookie('ee-flipy');
		clearCookie('ee-skew');
		clearCookie('ee-grayscale');
		clearCookie('ee-sepia');
		clearCookie('ee-saturate');
		clearCookie('ee-invert');
		res.cookie(name, value, {
			path: '/',
			domain: `.${config.publicConfig.host}`,
			httpOnly: false,
			secure: config.https.enable,
			expires: new Date(Date.now() + age),
			maxAge: age
		});
		res.locals.cookie[name] = value;
	}

	function clearCookie(name: string): void {
		res.clearCookie(name, {
			path: '/',
			domain: `.${config.publicConfig.host}`
		});
		res.locals.cookie[name] = undefined;
	}
}
