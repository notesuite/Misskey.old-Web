import { User } from '../../../../../models/user';
import { UserHomeLayout, IUserHomeLayout } from '../../../../../models/userHomeLayout';
import { MisskeyExpressRequest } from '../../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../../misskeyExpressResponse';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse, options: any = {}): void => {
	'use strict';

	const customizeMode: boolean = options.customize !== null ? options.customize : false;
	const me: User = req.me;
	const widgets: string[] = [
		'timeline',
		'my-status',
		'notices',
		'recommendation-users',
		'donate',
		'big-analog-clock',
		'small-analog-clock',
		'big-calendar',
		'small-calendar'
	];

	UserHomeLayout.findOne({userId: me.id}, (err: any, userLayout: IUserHomeLayout) => {
		const defaultLayout: any = {
			left: [],
			center: ['timeline'],
			right: ['my-status', 'notices', 'recommendation-users', 'donate']
		};
		const layout: any = userLayout !== null ? userLayout.layout : defaultLayout;
		const useWidgets: string[] = layout.left.concat(layout.center.concat(layout.right));
		const unuseWidgets: string[] = widgets.map((widget: string) => {
			if (useWidgets.indexOf(widget) === -1) {
				return widget;
			}
		});

		res.display(req, 'home', {
			layout: layout,
			unuseWidgets: unuseWidgets,
			customizeMode: customizeMode
		});
	});
};
