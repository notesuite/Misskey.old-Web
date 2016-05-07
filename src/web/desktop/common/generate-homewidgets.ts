const jade: any = require('jade');

import { User } from '../../../db/models/user';
import generateHomewidgetTimeline from './generate-homewidget-timeline';
import config from '../../../config';

export default function(me: User, locale: any, widgets: string[], tlsource: string): Promise<any> {
	return Promise.all(widgets.map((widget: string) => {
		return generateWidget(widget);
	}));

	function generateWidget(widget: string): Promise<string> {
		if (widget === undefined || widget === null) {
			return Promise.resolve(null);
		}

		switch (widget) {
			case 'timeline':
				return generateHomewidgetTimeline(me, locale, tlsource);
			default:
				const compiler: (locals?: any) => string = jade.compileFile(
					`${__dirname}/views/home-widgets/${widget}.jade`, {
						cache: true
				});
				return Promise.resolve(compiler({
					me: me,
					userSettings: me._settings,
					config: config.public,
					locale: locale
				}));
		}
	}
}
