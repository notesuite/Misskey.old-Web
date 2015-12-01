import { MisskeyExpressRequest } from '../../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../../misskey-express-response';
import requestApi from '../../../../../../utils/request-api';
import parsePostText from '../../../../../../utils/parse-post-text';
import mapToHtml from '../../../../../../utils/map-to-html';
import config from '../../../../../../config';

export default function replies(req: MisskeyExpressRequest, res: MisskeyExpressResponse): void {
	'use strict';

	requestApi('GET', 'posts/replies', req.query, req.session.userId).then((replies: Object[]) => {
		res.send(mapToHtml(
			`${__dirname}/../../../../../../sites/desktop/common/views/post/smart/subPostRender.jade`,
			'post',
			replies,
			{
				me: req.me,
				parsePostText: parsePostText,
				config: config.publicConfig
			}));
	}, (err: any) => {
		res.send(err);
	});
};
