import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';
import requestApi from '../../../../../utils/requestApi';
import parsePostText from '../../../../../utils/parsePostText';
import mapToHtml from '../../../../../utils/mapToHtml';
import config from '../../../../../config';

export default function(req: MisskeyExpressRequest, res: MisskeyExpressResponse): void {
	'use strict';

	requestApi('GET', 'posts/talk', req.query, req.session.userId).then((talk: Object[]) => {
		res.send(mapToHtml(
			`${__dirname}/../../../../../sites/desktop/views/lib/post/smart/subPostRender.jade`,
			'post',
			talk,
			{
				me: req.me,
				parsePostText: parsePostText,
				config: config.publicConfig
			}));
	}, (err: any) => {
		res.send(err);
	});
};
