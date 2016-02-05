import * as express from 'express';
import * as jade from 'jade';

module.exports = (req: express.Request, res: express.Response): void => {
	'use strict';
	const title = req.params['page'];
	const render: (locals?: any) => string = jade.compileFile(
		`${__dirname}/../../../../common/articles/${title}.jade`, {
			cache: true
	});
	res.locals.display({
		title: res.locals.locale.common.about.articles[title].title,
		article: render(res.locals)
	});
};
