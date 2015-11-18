const jade: any = require('jade');
import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';
import requestApi from '../../../../../utils/requestApi';

export default function(req: MisskeyExpressRequest, res: MisskeyExpressResponse): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../../sites/desktop/views/lib/post/smart/render.jade`);

	const photos: string = req.body['photos'];

	requestApi('POST', 'posts/timeline', req.body, req.session.userId).then((reply: Object) => {
		res.send(compiler(Object.assign({
			post: reply
		}, req.renderData)));
	}, (err: any) => {
		res.send(err);
	});
};
