import * as express from 'express';

export interface MisskeyExpressResponse extends express.Response {
	display: (data?: any) => void;
}
