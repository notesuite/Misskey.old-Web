import * as http from 'http';
import * as request from 'request';
// import * as gm from 'gm';
const gm: any = require('gm');
import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';
import requestApi from '../../../utils/requestApi';

export default function updateIcon(req: MisskeyExpressRequest, res: MisskeyExpressResponse): void {
	'use strict';
	const avaterFileId: string = req.body['file-id'];
	const trimX: number = Number(req.body['trim-x']);
	const trimY: number = Number(req.body['trim-y']);
	const trimW: number = Number(req.body['trim-w']);
	const trimH: number = Number(req.body['trim-h']);

	requestApi('GET', 'album/files/show', {
		'file-id': avaterFileId
	}, req.session.userId).then((file: any) => {
		if (file.dataSize > 3000000) {
			return res.status(500).send('big-data');
		}
		request({
			url: file.url,
			encoding: null
		}, (getFileErr: any, response: http.IncomingMessage, body: Buffer) => {
			if (getFileErr !== null) {
				console.error(getFileErr);
				return res.status(500).send('something-happened');
			}
			gm(body, file.name)
				.crop(trimW, trimH, trimX, trimY)
				.toBuffer('png', (err: Error, buffer: Buffer) => {
					if (err !== null) {
						console.error(err);
						return res.status(500).send('something-happened');
					}
					requestApi('POST', 'album/files/upload', {
						file: {
							value: buffer,
							options: {
								filename: `${file.name}.cropped.png`,
								contentType: 'image/png'
							}
						}
					}, req.session.userId).then((albumFile: any) => {
						requestApi('PUT', 'account/update-avatar', {
							'file-id': albumFile.id
						}, req.session.userId).then((me: Object) => {
							res.send(albumFile);
						}, (updateErr: any) => {
							return res.status(500).send('something-happened');
						});
					}, (uploadErr: any) => {
						return res.status(500).send('something-happened');
					});
				});
		});
	});
};
