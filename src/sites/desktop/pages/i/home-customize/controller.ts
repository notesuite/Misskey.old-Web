import { HomeLayout, IHomeLayout } from '../../../../../models/home-layout';
import { MisskeyExpressRequest } from '../../../../../misskey-express-request';
import { MisskeyExpressResponse } from '../../../../../misskey-express-response';
import generateHomewidgets from '../../../common/generate-homewidgets';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';

	const widgetCatalog = [
		'timeline',
		'my-status',
		'notifications',
		'recommendation-users',
		'donate',
		'ad',
		'big-analog-clock',
		'small-analog-clock',
		'big-calendar',
		'small-calendar'];

	const me: any = req.me;
	const widgets: any = {
		left: [],
		center: [],
		right: []
	};

	HomeLayout.findOne({userId: me.id}, (homeLayoutFindErr: any, userLayout: IHomeLayout) => {
		const layout: any = userLayout !== null ? userLayout.layout : {
			left: [],
			center: ['timeline'],
			right: ['my-status', 'notifications', 'recommendation-users', 'donate', 'ad']
		};
		const useWidgets = layout.left.concat(layout.center.concat(layout.right));
		const unuseWidgets = widgetCatalog.map(widgetName => {
			if (useWidgets.indexOf(widgetName) === -1) {
				return widgetName;
			}
		});
		generateHomewidgets(me, unuseWidgets, 'home').then((unuses: string[]) => {
			const unuseWidgetHtmls = unuses;
			generateHomewidgets(me, layout.left, 'home').then((lefts: string[]) => {
				widgets.left = lefts;
				generateHomewidgets(me, layout.center, 'home').then((centers: string[]) => {
					widgets.center = centers;
					generateHomewidgets(me, layout.right, 'home').then((rights: string[]) => {
						widgets.right = rights;
						res.display({
							widgets,
							unuseWidgets: unuseWidgetHtmls
						});
					});
				});
			});
		});
	});
};
