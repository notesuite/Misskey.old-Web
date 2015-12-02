import * as express from 'express';
import { HomeLayout, IHomeLayout } from '../../../models/home-layout';

export default function updateHomeLayout(req: express.Request, res: express.Response): void {
	'use strict';
	const layoutString: string = req.body['layout'];
	const layout = JSON.parse(layoutString);

	const saveLayout: any = {
		left: [],
		center: [],
		right: []
	};
	if (layout.left !== undefined) {
		saveLayout.left = layout.left;
	}
	if (layout.center !== undefined) {
		saveLayout.center = layout.center;
	}
	if (layout.right !== undefined) {
		saveLayout.right = layout.right;
	}

	HomeLayout.findOne({
		userId: req.user.id
	}, (err: any, userHomeLayout: IHomeLayout) => {
		if (userHomeLayout !== null) {
			userHomeLayout.layout = saveLayout;
			userHomeLayout.save();
			res.send('ok');
		} else {
			HomeLayout.create({
				userId: req.user.id,
				layout: saveLayout
			}, (createErr: any, created: IHomeLayout) => {
				res.send('ok');
			});
		}
	});
};
