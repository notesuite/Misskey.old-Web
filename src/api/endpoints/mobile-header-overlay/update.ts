import * as express from 'express';
import { UserSettings, IUserSettings } from '../../../db/models/user-settings';

export default function (req: express.Request, res: express.Response): void {
	const id: string = req.body['id'];

	UserSettings.findOne({
		userId: req.user
	}, (findErr: any, settings: IUserSettings) => {
		if (findErr !== null) {
			res.sendStatus(500);
			return;
		}
		settings.mobileHeaderOverlay = id === 'none' ? null : id;
		settings.save((saveErr: any, savedSettings: IUserSettings) => {
			if (saveErr !== null) {
				res.sendStatus(500);
				return;
			}
			req.session.save(() => {
				res.sendStatus(200);
			});
		});
	});
};
