import { MisskeyExpressRequest } from './misskeyExpressRequest';
import { MisskeyExpressResponse } from './misskeyExpressResponse';

export default function callController(req: MisskeyExpressRequest, res: MisskeyExpressResponse, name: string, options?: any): void {
	'use strict';

	res.display = (data: any = {}): void => {
		const viewPath: string = `${__dirname}/sites/${req.ua}/pages/${name}/view`;
		Object.assign(data, req.renderData);
		res.render(viewPath, data);
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
