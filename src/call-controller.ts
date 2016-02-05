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

		let eeStyle: string;
		if (res.locals.cookie['ee-flipy'] !== undefined) {
			eeStyle = 'html { transform: scaleY(-1); }';
		} else if (res.locals.cookie['ee-flipx'] !== undefined) {
			eeStyle = 'html { transform: scaleX(-1); }';
		} else if (res.locals.cookie['ee-skew'] !== undefined) {
			eeStyle = 'html { transform: skew(-20deg); }';
		} else if (res.locals.cookie['ee-grayscale'] !== undefined) {
			eeStyle = 'html { filter: grayscale(100%); -webkit-filter: grayscale(100%); }';
		} else if (res.locals.cookie['ee-sepia'] !== undefined) {
			eeStyle = 'html { filter: sepia(100%); -webkit-filter: sepia(100%); }';
		} else if (res.locals.cookie['ee-saturate'] !== undefined) {
			eeStyle = 'html { filter: saturate(1000%); -webkit-filter: saturate(1000%); }';
		} else if (res.locals.cookie['ee-invert'] !== undefined) {
			eeStyle = 'html { filter: invert(100%); -webkit-filter: invert(100%); }';
		}
		res.locals.eeStyle = eeStyle;

		const locale = res.locals.locale;

		res.locals.locale = {
			common: locale.common,
			sites: {}
		};

		res.locals.locale.sites[res.locals.ua] = {
			common: locale.sites[res.locals.ua].common,
			pages: {}
		};

		res.locals.locale.sites[res.locals.ua].pages[name] = locale.sites[res.locals.ua].pages[name];

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
