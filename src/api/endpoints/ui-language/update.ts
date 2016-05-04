import * as express from 'express';
import { UserSettings, IUserSettings } from '../../../db/models/user-settings';

export default function (req: express.Request, res: express.Response): void {
	const lang: string = req.body['lang'];

	UserSettings.findOne({
		userId: req.user
	}, (findErr: any, settings: IUserSettings) => {
		if (findErr !== null) {
			res.sendStatus(500);
			return;
		}
		if (lang === '_auto') {
			settings.uiLanguage = null;
		} else {
			settings.uiLanguage = lang;
		}
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
