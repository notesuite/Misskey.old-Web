import * as express from 'express';
const jade: any = require('jade');
import requestApi from '../../../../../../utils/request-api';
import parsePostText from '../../../../../../utils/parse-post-text';
import config from '../../../../../../config';

export default function timeline(req: express.Request, res: express.Response): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../../../sites/desktop/common/views/post/smart/posts.jade`);

	requestApi('posts/timeline', req.query, req.user).then((tl: Object[]) => {
		res.send(compiler({
			posts: tl,
			me: req.user,
			parsePostText: parsePostText,
			config: config.publicConfig
		}));
	}, (err: any) => {
		res.send(err);
	});
};
