import * as express from 'express';
import { UserSettings, IUserSettings } from '../../../db/models/user-settings';

export default function (req: express.Request, res: express.Response): void {
	const duration: string = req.body['duration'];

	UserSettings.findOne({
		userId: req.user
	}, (findErr: any, settings: IUserSettings) => {
		if (findErr !== null) {
			res.sendStatus(500);
			return;
		}
		settings.pseudoPushNotificationDisplayDuration = Number(duration);
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
