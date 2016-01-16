import * as express from 'express';
import config from './config';

export default function callController(
	req: express.Request,
	res: express.Response,
	name: string,
	options: any = null
): void {
	'use strict';

	res.locals.display = (data: any = {}): void => {
		const viewPath: string = `${__dirname}/sites/${res.locals.ua}/pages/${name}/view`;
		if (data.overrideTheme !== undefined && data.overrideTheme !== null) {
			data.stylePath = `${config.publicConfig.resourcesUrl}/${res.locals.ua}/pages/${name}/style.${data.overrideTheme}.css`;
		} else if (res.locals.isLogin && req.user._settings.theme !== null) {
			data.stylePath = `${config.publicConfig.resourcesUrl}/${res.locals.ua}/pages/${name}/style.${req.user._settings.theme}.css`;
		} else {
			data.stylePath = `${config.publicConfig.resourcesUrl}/${res.locals.ua}/pages/${name}/style.css`;
		}
		data.scriptPath = `${config.publicConfig.resourcesUrl}/${res.locals.ua}/pages/${name}/script.js`;
		delete res.locals.display;
		res.render(viewPath, data);
	};

	let controller: any;
	switch (res.locals.ua) {
		case 'desktop':
			controller = require(`./sites/desktop/pages/${name}/controller`);
			break;
		case 'mobile':
			controller = require(`./sites/mobile/pages/${name}/controller`);
			break;
		default:
			controller = require(`./sites/desktop/pages/${name}/controller`);
			break;
	}

	try {
		controller(req, res, options);
	} catch (e) {
		callController(req, res, 'error', e);
	}
}
