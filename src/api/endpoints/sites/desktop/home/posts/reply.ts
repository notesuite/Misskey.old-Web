const jade: any = require('jade');
import { MisskeyExpressRequest } from '../../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../../misskeyExpressResponse';
import requestApi from '../../../../../../utils/requestApi';
import parsePostText from '../../../../../../utils/parsePostText';
import config from '../../../../../../config';

export default function reply(req: MisskeyExpressRequest, res: MisskeyExpressResponse): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../../../sites/desktop/views/lib/post/smart/subPostRender.jade`);

	const photos: string = req.body['photos'];

	if (photos !== undefined && photos !== null && photos !== '[]') {
		requestApi('POST', 'posts/photo', req.body, req.session.userId).then((reply: Object) => {
			res.send(compiler({
				post: reply,
				me: req.me,
				parsePostText: parsePostText,
				config: config.publicConfig
			}));
		}, (err: any) => {
			res.send(err);
		});
	} else {
		requestApi('POST', 'posts/status', req.body, req.session.userId).then((reply: Object) => {
			res.send(compiler({
				post: reply,
				me: req.me,
				parsePostText: parsePostText,
				config: config.publicConfig
			}));
		}, (err: any) => {
			res.send(err);
		});
	}
};
