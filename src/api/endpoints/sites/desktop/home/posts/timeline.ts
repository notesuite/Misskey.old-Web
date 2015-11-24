import * as express from 'express';
const jade: any = require('jade');
import requestApi from '../../../../../../utils/requestApi';
import parsePostText from '../../../../../../utils/parsePostText';
import config from '../../../../../../config';

export default function timeline(req: express.Request, res: express.Response): void {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../../../sites/desktop/views/lib/post/smart/posts.jade`);

	requestApi('GET', 'posts/timeline', req.query, req.user).then((tl: Object[]) => {
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
