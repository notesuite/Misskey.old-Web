import * as express from 'express';
import { UserSettings, IUserSettings } from '../../../db/models/user-settings';

export default function (req: express.Request, res: express.Response): void {
	const lang: string = req.body['lang'];

	UserSettings.findOne({
		userId: req.user
	}, (findErr: any, settings: IUserSettings) => {
		if (findErr !== null) {
			return res.sendStatus(500);
		}
		if (lang === '_auto') {
			settings.uiLanguage = null;
		} else {
			settings.uiLanguage = lang;
		}
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
