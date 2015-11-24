import { User } from '../../../models/user';
import { UserHomeLayout, IUserHomeLayout } from '../../../models/userHomeLayout';

import generateHomewidgetTimeline from './generate-homewidget-timeline';
import generateHomewidgetDonate from './generate-homewidget-donate';

export default function generateHomewidgets(me: User, tlsource: string): Promise<any> {
	'use strict';

	const generatedWidgets: any = {
		left: [],
		center: [],
		right: []
	};

	const defaultLayout: any = {
		left: [],
		center: ['timeline'],
		right: ['my-status', 'notices', 'recommendation-users', 'donate']
	};

	return new Promise<string>((resolve, reject) => {
		UserHomeLayout.findOne({userId: me.id}, (homeLayoutFindErr: any, userLayout: IUserHomeLayout) => {
			const layout: any = userLayout ? userLayout.layout : defaultLayout;

			Promise.all(layout.left.map((widget: string) => {
				return generateWidget(widget);
			})).then((lefts: string[]) => {
				generatedWidgets.left = lefts;
				Promise.all(layout.center.map((widget: string) => {
					return generateWidget(widget);
				})).then((centers: string[]) => {
					generatedWidgets.center = centers;
					Promise.all(layout.right.map((widget: string) => {
						return generateWidget(widget);
					})).then((rights: string[]) => {
						generatedWidgets.right = rights;
						resolve(generatedWidgets);
					}, reject);
				}, reject);
			}, reject);
		});
	});

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
