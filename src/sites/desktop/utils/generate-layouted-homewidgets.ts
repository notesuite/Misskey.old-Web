import { User } from '../../../models/user';
import { UserHomeLayout, IUserHomeLayout } from '../../../models/userHomeLayout';

import generateHomewidgets from './generate-homewidgets';

export default function generateLayoutedHomewidgets(me: User, tlsource: string): Promise<any> {
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

			generateHomewidgets(me, layout.left, tlsource).then((lefts: string[]) => {
				generatedWidgets.left = lefts;
				generateHomewidgets(me, layout.center, tlsource).then((centers: string[]) => {
					generatedWidgets.center = centers;
					generateHomewidgets(me, layout.right, tlsource).then((rights: string[]) => {
						generatedWidgets.right = rights;
						resolve(generatedWidgets);
					}, reject);
				}, reject);
			}, reject);
		});
	});
}
