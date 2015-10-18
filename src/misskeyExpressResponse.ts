import * as express from 'express';
import { MisskeyExpressRequest } from './misskeyExpressRequest';

export interface MisskeyExpressResponse extends express.Response {
	display: (req: MisskeyExpressRequest, res: express.Response, viewName: string, renderData: any) => void;
}
