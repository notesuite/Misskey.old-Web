import * as express from 'express';
import requestApi from '../../../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
		const dialog: string = req.query.dialog;
	let isDialog = false;
	if (dialog !== undefined && dialog !== null) {
		res.locals.noui = true;
		isDialog = true;
	}
	requestApi('album/tags/list', {}, req.user).then((tags: Object) => {
		res.locals.display({
			albumTags: tags,
			isDialog: isDialog
		}, 'i/album');
	});
};
