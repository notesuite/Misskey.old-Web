import * as express from 'express';
import requestApi from '../../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	if (res.locals.file.folder !== null) {
		requestApi('album/folders/show', {
			'folder-id': res.locals.file.folder
		}, req.user).then((folder: Object) => {
			res.locals.display({
				folder: folder
			}, 'i/album');
		});
	} else {
		res.locals.display({
			folder: null
		}, 'i/album');
	}
};
