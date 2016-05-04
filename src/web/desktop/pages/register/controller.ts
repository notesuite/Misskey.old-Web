import * as express from 'express';

module.exports = (req: express.Request, res: express.Response): void => {
		res.locals.display({
		screenNameInputId: Math.random().toString(36),
		passwordInputId: Math.random().toString(36),
		retypePasswordInputId: Math.random().toString(36)
	});
};
