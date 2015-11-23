import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';

const jade: any = require('jade');

export default function open(req: MisskeyExpressRequest, res: MisskeyExpressResponse): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../sites/desktop/views/common/album.jade`);

	const browser: string = compiler(req.renderData);

	res.send(browser);
};
