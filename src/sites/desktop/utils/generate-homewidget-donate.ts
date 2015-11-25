const jade: any = require('jade');

import { User } from '../../../models/user';
import config from '../../../config';

export default function generateHomewidgetDonate(me: User): Promise<string> {
	'use strict';

	const compiler: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../views/lib/home-widgets/donate.jade`, {
			filename: 'jade',
			cache: true
	});

	return Promise.resolve(compiler({
		me: me,
		config: config.publicConfig
	}));
}
