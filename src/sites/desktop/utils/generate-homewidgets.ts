import { User } from '../../../models/user';

import generateHomewidgetTimeline from './generate-homewidget-timeline';
import generateHomewidgetDonate from './generate-homewidget-donate';

export default function generateHomewidgets(me: User, widgets: string[], tlsource: string): Promise<any> {
	'use strict';

	return Promise.all(widgets.map((widget: string) => {
		return generateWidget(widget);
	}));

	function generateWidget(widget: string): Promise<string> {
		'use strict';

		switch (widget) {
			case 'timeline':
				return generateHomewidgetTimeline(me, tlsource);
			case 'donate':
				return generateHomewidgetDonate(me);
			default:
				return Promise.resolve(null);
		}
	}
}
