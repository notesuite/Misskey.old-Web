const jade: any = require('jade');

import { User } from '../../../models/user';
import { Post } from '../../../models/post';
import parsePostText from '../../../utils/parsePostText';
import requestApi from '../../../utils/requestApi';

import config from '../../../config';

/**
 * @param tlsource 'home' or 'mentions'
 */
export default function generateHomewidgetTimeline(me: User, tlsource: string): Promise<string> {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../views/lib/home-widgets/timeline.jade`);

	return new Promise<string>((resolve, reject) => {
		switch (tlsource) {
			case 'home':
				requestApi('GET', 'posts/timeline', { 'limit': 10 }, me.id).then((tl: Post[]) => {
					resolve(compile(tl));
				}, reject);
				break;
			case 'mentions':
				requestApi('GET', 'posts/mentions', { 'limit': 10 }, me.id).then((tl: Post[]) => {
					resolve(compile(tl));
				}, reject);
				break;
			default:
				break;
		}

		function compile(tl: any): string {
			return compiler({
				posts: tl,
				me: me,
				parsePostText: parsePostText,
				config: config.publicConfig
			});
		}
	});
}