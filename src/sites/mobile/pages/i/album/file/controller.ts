import * as express from 'express';
import requestApi from '../../../../../../core/request-api';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';

	requestApi('album/tags/list', {}, req.user).then((tags: Object) => {
		if (res.locals.file.folder !== null) {
			requestApi('album/folders/show', {
				'folder-id': res.locals.file.folder
			}, req.user).then((folder: Object) => {
				res.locals.display({
					albumTags: tags,
					folder: folder
				}, 'i/album');
			});
		} else {
			res.locals.display({
				albumTags: tags,
				folder: null
			}, 'i/album');
		}
	});
};
