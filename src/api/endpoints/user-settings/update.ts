import * as express from 'express';
import { UserSettings, IUserSettings } from '../../../models/user-settings';

export default function updateHomeLayout(
	req: express.Request,
	res: express.Response
): void {
	'use strict';

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
			return res.sendStatus(500);
		}
		(<any>settings)[key] = value;
		settings.save((saveErr: any, savedSettings: IUserSettings) => {
			if (saveErr !== null) {
				return res.sendStatus(500);
			} else {
				res.sendStatus(200);
			}
		});
	});
};
