import * as express from 'express';
import generateHomewidgets from '../../../common/generate-homewidgets';

module.exports = (req: express.Request, res: express.Response): void => {
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

	const me: any = req.user;
	const widgets: any = {
		left: [],
		center: [],
		right: []
	};

	const layout: any = req.user._settings.homeLayout;
	const useWidgets = layout.left.concat(layout.center.concat(layout.right));
	const unuseWidgets = widgetCatalog.map(widgetName => {
		if (useWidgets.indexOf(widgetName) === -1) {
			return widgetName;
		}
	});
	generateHomewidgets(me, res.locals.locale, unuseWidgets, 'home').then((unuses: string[]) => {
		const unuseWidgetHtmls = unuses;
		generateHomewidgets(me, res.locals.locale, layout.left, 'home').then((lefts: string[]) => {
			widgets.left = lefts;
			generateHomewidgets(me, res.locals.locale, layout.center, 'home').then((centers: string[]) => {
				widgets.center = centers;
				generateHomewidgets(me, res.locals.locale, layout.right, 'home').then((rights: string[]) => {
					widgets.right = rights;
					res.locals.display({
						noui: true,
						widgets,
						unuseWidgets: unuseWidgetHtmls
					});
				});
			});
		});
	});
};
