import * as http from 'http';
import * as express from 'express';
import * as request from 'request';
// import * as gm from 'gm';
const gm: any = require('gm');
import requestApi from '../../../../utils/requestApi';

export default function updateavatar(req: express.Request, res: express.Response): void {
	'use strict';
	const avaterFileId: string = req.body['file-id'];
	const trimX: number = Number(req.body['trim-x']);
	const trimY: number = Number(req.body['trim-y']);
	const trimW: number = Number(req.body['trim-w']);
	const trimH: number = Number(req.body['trim-h']);

	requestApi('GET', 'album/files/show', {
		'file-id': avaterFileId
	}, req.user).then((file: any) => {
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
				}, req.user, true).then((albumFile: any) => {
					requestApi('PUT', 'account/update-avatar', {
						'file-id': albumFile.id
					}, req.user).then((me: Object) => {
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
