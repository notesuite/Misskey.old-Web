import { User } from '../../../models/user';
import generateHomewidgets from './generate-homewidgets';

export default function generateLayoutedHomewidgets(me: User, tlsource: string): Promise<any> {
	'use strict';

	const layout: any = me._settings.homeLayout;

	const generatedWidgets: any = {
		left: [],
		center: [],
		right: []
	};

	return new Promise<string>((resolve, reject) => {
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
}
