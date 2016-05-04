import * as express from 'express';
import { UserSettings, IUserSettings } from '../../../db/models/user-settings';

export default function (
	req: express.Request,
	res: express.Response
): void {

	const key: string = req.body['key'].trim();
	const value: string = req.body['value'].trim();

	if (key[0] === '_') {
		res.sendStatus(400);
		return;
	}

	if (key === 'userId') {
		res.sendStatus(400);
		return;
	}

	UserSettings.findOne({
		userId: req.user
	}, (findErr: any, settings: IUserSettings) => {
		if (findErr !== null) {
			res.sendStatus(500);
			return;
		}
		(<any>settings)[key] = value;
		settings.save((saveErr: any, savedSettings: IUserSettings) => {
			if (saveErr !== null) {
				res.sendStatus(500);
				return;
			} else {
				res.sendStatus(200);
			}
		});
	});
};
