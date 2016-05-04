import * as express from 'express';
import requestApi from '../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
		const folderId: string = req.query.folder;
	if (folderId !== undefined && folderId !== null) {
		requestApi('album/folders/show', {
			'folder-id': folderId
		}, req.user).then((folder: Object) => {
			res.locals.display({
				folder: folder
			}, 'i/upload');
		});
	} else {
		res.locals.display({
			folder: null
		}, 'i/upload');
	}
};
