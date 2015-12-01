import { User } from '../../../models/user';
import { HomeLayout, IHomeLayout } from '../../../models/home-layout';
import generateHomewidgets from './generate-homewidgets';

export default function generateLayoutedHomewidgets(me: User, tlsource: string): Promise<any> {
	'use strict';

	const generatedWidgets: any = {
		left: [],
		center: [],
		right: []
	};

	return new Promise<string>((resolve, reject) => {
		HomeLayout.findOne({userId: me.id}, (homeLayoutFindErr: any, userLayout: IHomeLayout) => {
			const layout: any = userLayout !== null ? userLayout.layout : {
				left: [],
				center: ['timeline'],
				right: ['my-status', 'notifications', 'recommendation-users', 'donate']
			};
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
