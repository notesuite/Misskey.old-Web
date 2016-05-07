import * as express from 'express';

module.exports = (req: express.Request, res: express.Response): void => {
	const choose: string = req.query.choose;
	if (choose !== undefined && choose !== null) {
		res.locals.noui = true;
	}
	res.locals.display({
		choose
	}, 'i/album');
};
