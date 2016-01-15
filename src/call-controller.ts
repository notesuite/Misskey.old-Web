import { MisskeyExpressRequest } from './misskey-express-request';
import { MisskeyExpressResponse } from './misskey-express-response';
import config from './config';

export default function callController(
	req: MisskeyExpressRequest,
	res: MisskeyExpressResponse,
	name: string,
	options: any = null
): void {
	'use strict';

	if (!req.hasOwnProperty('ua')) {
		req.ua = 'desktop';
	}

	res.display = (data: any = {}): void => {
		const viewPath: string = `${__dirname}/sites/${req.ua}/pages/${name}/view`;
		if (data.overrideTheme !== undefined && data.overrideTheme !== null) {
			data.stylePath = `${config.publicConfig.resourcesUrl}/${req.ua}/pages/${name}/style.${data.overrideTheme}.css`;
		} else if (req.isLogin && req.user._settings.theme !== null) {
			data.stylePath = `${config.publicConfig.resourcesUrl}/${req.ua}/pages/${name}/style.${req.session.userSettings.theme}.css`;
		} else {
			data.stylePath = `${config.publicConfig.resourcesUrl}/${req.ua}/pages/${name}/style.css`;
		}
		data.scriptPath = `${config.publicConfig.resourcesUrl}/${req.ua}/pages/${name}/script.js`;
		const renderOptions = Object.assign({}, req.renderData, data);
		res.render(viewPath, renderOptions);
	};

	let controller: any;
	switch (req.ua) {
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
