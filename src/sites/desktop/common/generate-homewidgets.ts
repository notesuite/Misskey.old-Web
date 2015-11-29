const jade: any = require('jade');

import { User } from '../../../models/user';
import generateHomewidgetTimeline from './generate-homewidget-timeline';
import config from '../../../config';

export default function generateHomewidgets(me: User, widgets: string[], tlsource: string): Promise<any> {
	'use strict';

	return Promise.all(widgets.map((widget: string) => {
		return generateWidget(widget);
	}));

	function generateWidget(widget: string): Promise<string> {
		'use strict';

		if (widget === undefined || widget === null) {
			return Promise.resolve(null);
		}

		switch (widget) {
			case 'timeline':
				return generateHomewidgetTimeline(me, tlsource);
			default:
				const compiler: (locals?: any) => string = jade.compileFile(
					`${__dirname}/../views/home-widgets/${widget}.jade`, {
						filename: 'jade',
						cache: true
				});
				return Promise.resolve(compiler({
					me: me,
					config: config.publicConfig
				}));
		}
	}
}
