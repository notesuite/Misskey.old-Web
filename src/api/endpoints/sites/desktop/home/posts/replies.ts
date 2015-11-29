import { MisskeyExpressRequest } from '../../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../../misskeyExpressResponse';
import requestApi from '../../../../../../utils/requestApi';
import parsePostText from '../../../../../../utils/parsePostText';
import mapToHtml from '../../../../../../utils/mapToHtml';
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
