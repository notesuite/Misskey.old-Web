import * as fs from 'fs';
import * as express from 'express';
import { MisskeyExpressRequest } from '../../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../../misskeyExpressResponse';
import requestApi from '../../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	requestApi('POST', 'statuses/update', req.query, req.session.userId).then((status: Object) => {

	});
};
