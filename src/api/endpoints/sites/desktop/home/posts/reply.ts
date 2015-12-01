import * as express from 'express';
const jade: any = require('jade');
import requestApi from '../../../../../../utils/request-api';
import parsePostText from '../../../../../../utils/parse-post-text';
import config from '../../../../../../config';

export default function reply(req: express.Request, res: express.Response): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../../../sites/desktop/common/views/post/smart/subPostRender.jade`);

	const photos: string = req.body['photos'];

	if (photos !== undefined && photos !== null && photos !== '[]') {
		requestApi('POST', 'posts/photo', req.body, req.user).then((reply: Object) => {
			res.send(compiler({
				post: reply,
				me: req.user,
				parsePostText: parsePostText,
				config: config.publicConfig
			}));
		}, (err: any) => {
			res.send(err);
		});
	} else {
		requestApi('POST', 'posts/status', req.body, req.user).then((reply: Object) => {
			res.send(compiler({
				post: reply,
				me: req.user,
				parsePostText: parsePostText,
				config: config.publicConfig
			}));
		}, (err: any) => {
			res.send(err);
		});
	}
};
