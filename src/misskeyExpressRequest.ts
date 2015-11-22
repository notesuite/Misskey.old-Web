import * as express from 'express';
import { User } from './models/user';

export interface MisskeyExpressRequest extends express.Request {
	isLogin: boolean;
	ua: string;
	session: any;
	renderData: any;
	me: User;
	data: any;
}
