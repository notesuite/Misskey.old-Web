import * as express from 'express';
import config from './config';

/* tslint:disable:no-eval */

export default function callController(
	req: express.Request,
	res: express.Response,
	path: string,
	options: any = null
): void {
	'use strict';

	res.locals.display = (data: any = {}, addLocalePagePath: string = null): void => {
		const viewPath: string = `${__dirname}/sites/${res.locals.ua}/pages/${path}/view`;
		if (data.overrideTheme !== undefined && data.overrideTheme !== null) {
			data.stylePath = `${config.publicConfig.resourcesUrl}/${res.locals.ua}/pages/${path}/style.${data.overrideTheme}.css`;
		} else if (res.locals.isLogin && req.user._settings.theme !== null) {
			data.stylePath = `${config.publicConfig.resourcesUrl}/${res.locals.ua}/pages/${path}/style.${req.user._settings.theme}.css`;
		} else {
			data.stylePath = `${config.publicConfig.resourcesUrl}/${res.locals.ua}/pages/${path}/style.css`;
		}
		data.scriptPath = `${config.publicConfig.resourcesUrl}/${res.locals.ua}/pages/${path}/script.js`;
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

		const parts = path.split('/');
		let s = 'res.locals.locale.sites[res.locals.ua].pages = ';

		parts.forEach(part => {
			s += `{'${part}': `;
		});

		s += '{}';

		parts.forEach(part => {
			s += '}';
		});

		s += '; res.locals.locale.sites[res.locals.ua].pages';

		parts.forEach(part => {
			s += `['${part}']`;
		});

		s += ' = locale.sites[res.locals.ua].pages';

		parts.forEach(part => {
			s += `['${part}']`;
		});

		s += ';';

		eval(s);

		if (addLocalePagePath !== null) {
			const parts2 = addLocalePagePath.split('/');
			let s2 = 'var addLocale = ';

			parts2.forEach(part => {
				s2 += `{'${part}': `;
			});

			s2 += '{}';

			parts2.forEach(part => {
				s2 += '}';
			});

			s2 += '; addLocale';

			parts2.forEach(part => {
				s2 += `['${part}']`;
			});

			s2 += ' = locale.sites[res.locals.ua].pages';

			parts2.forEach(part => {
				s2 += `['${part}']`;
			});

			s2 += ';';

			s2 += 'Object.assign(res.locals.locale.sites[res.locals.ua].pages, addLocale);';

			eval(s2);
		}

		res.render(viewPath, data);
	};

	let controller: any;
	switch (res.locals.ua) {
		case 'desktop':
			controller = require(`./sites/desktop/pages/${path}/controller`);
			break;
		case 'mobile':
			controller = require(`./sites/mobile/pages/${path}/controller`);
			break;
		default:
			controller = require(`./sites/desktop/pages/${path}/controller`);
			break;
	}

	try {
		controller(req, res, options);
	} catch (e) {
		callController(req, res, 'error', e);
	}
}
