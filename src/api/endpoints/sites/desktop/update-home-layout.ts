import * as express from 'express';
import { UserHomeLayout, IUserHomeLayout } from '../../../../models/userHomeLayout';

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
	if (layout.center != null) {
		saveLayout.center = layout.center;
	}
	if (layout.right != null) {
		saveLayout.right = layout.right;
	}

	UserHomeLayout.findOne({
		userId: req.user.id
	}, (err: any, userHomeLayout: IUserHomeLayout) => {
		if (userHomeLayout !== null) {
			userHomeLayout.layout = saveLayout;
			userHomeLayout.save();
			res.send('ok');
		} else {
			UserHomeLayout.create({
				userId: req.user.id,
				layout: saveLayout
			}, (err: any, created: IUserHomeLayout) => {
				res.send('ok');
			});
		}
	});
};
