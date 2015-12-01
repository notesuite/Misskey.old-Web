import * as express from 'express';
import requestApi from '../../../../../../utils/request-api';
import parsePostText from '../../../../../../utils/parse-post-text';
import mapToHtml from '../../../../../../utils/map-to-html';
import config from '../../../../../../config';

export default function talk(req: express.Request, res: express.Response): void {
	'use strict';

	requestApi('posts/talk', req.query, req.user).then((talk: Object[]) => {
		res.send(mapToHtml(
			`${__dirname}/../../../../../../sites/desktop/common/views/post/smart/subPostRender.jade`,
			'post',
			talk,
			{
				me: req.user,
				parsePostText: parsePostText,
				config: config.publicConfig
			}));
	}, (err: any) => {
		res.send(err);
	});
};
