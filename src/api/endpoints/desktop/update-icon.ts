import * as http from 'http';
import * as request from 'request';
import * as gm from 'gm';
import { MisskeyExpressRequest } from '../../../misskeyExpressRequest';
import { MisskeyExpressResponse } from '../../../misskeyExpressResponse';
import requestApi from '../../../utils/requestApi';

module.exports = (req: MisskeyExpressRequest, res: MisskeyExpressResponse): void => {
	'use strict';
	const avaterFileId: string = req.body['file-id'];
	const trimX: number = req.body['trim-x'];
	const trimY: number = req.body['trim-y'];
	const trimW: number = req.body['trim-w'];
	const trimH: number = req.body['trim-h'];

	requestApi('GET', 'album/files/show', {
		'file-id': avaterFileId
	}, req.session.userId).then((file: any) => {
		if (file.dataSize > 3000000) {
			return res.send(500, 'big-data');
		}
		request(file.url, (getFileErr: any, response: http.IncomingMessage, body: string) => {
			gm(body)
				.crop(trimW, trimH, trimX, trimY)
				.toBuffer('png', (err: Error, buffer: Buffer) =>
			{
				if (err !== null) {
					console.error(err);
					return res.send(500, err);
				}
				requestApi('POST', 'album/files/upload', {
					file: {
						value: buffer,
						options: {
							filename: `cropped-${file.name}`,
							contentType: 'image/png'
						}
					}
				}, req.session.userId).then((albumFile: Object) => {
					res.send(albumFile);
				});
			});
		});
	});
};
