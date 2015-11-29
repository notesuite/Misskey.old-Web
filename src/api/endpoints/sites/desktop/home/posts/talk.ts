import * as express from 'express';
import requestApi from '../../../../../../utils/requestApi';
import parsePostText from '../../../../../../utils/parsePostText';
import mapToHtml from '../../../../../../utils/mapToHtml';
import config from '../../../../../../config';

export default function talk(req: express.Request, res: express.Response): void {
	'use strict';

	requestApi('GET', 'posts/talk', req.query, req.user).then((talk: Object[]) => {
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
