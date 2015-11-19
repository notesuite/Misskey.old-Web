const jade: any = require('jade');
import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';
import requestApi from '../../../../../utils/requestApi';
import config from '../../../../../config';

export default function(req: MisskeyExpressRequest, res: MisskeyExpressResponse): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../../sites/desktop/views/lib/post/smart/posts.jade`);

	requestApi('GET', 'posts/timeline', req.query, req.session.userId).then((tl: Object[]) => {
		res.send(compiler({
			posts: tl,
			me: req.me,
			config: config.publicConfig
		}));
	}, (err: any) => {
		res.send(err);
	});
};
