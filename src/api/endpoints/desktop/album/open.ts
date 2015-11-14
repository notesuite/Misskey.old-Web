import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
import config from '../../../../config';

const jade: any = require('jade');

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../sites/desktop/views/common/album.jade`);

	const browser: string = compiler({
		config: config.publicConfig
	});

	res.send(browser);
};
