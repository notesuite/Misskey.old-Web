import * as express from 'express';
import { UserSettings, IUserSettings } from '../../../models/user-settings';

export default function updateHomeLayout(req: express.Request, res: express.Response): void {
	'use strict';

	const id: string = req.body['id'];

	UserSettings.findOne({
		userId: req.user
	}, (findErr: any, settings: IUserSettings) => {
		if (findErr !== null) {
			return res.sendStatus(500);
		}
		settings.mobileHeaderOverlay = id;
		settings.save((saveErr: any, savedSettings: IUserSettings) => {
			if (saveErr !== null) {
				return res.sendStatus(500);
			}
			req.session.save(() => {
				res.sendStatus(200);
			});
		});
	});
};
