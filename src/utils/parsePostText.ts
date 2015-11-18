const marked: any = require('marked');
const escapeHtml: any = require('escape-html');

import config from '../config';

export default function(text: string, isPlain: boolean): string {
	'use strict';
	if (text === null) {
		return null;
	}
	if (isPlain) {
		text = escapeHtml(text).replace(/https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+/g, (url: string) => {
			return `<a href="${url}" target="_blank" class="url">${url}</a>`;
		}).replace(/@([a-zA-Z0-9\-]+)/g, (arg: string, screenName: string) => {
			return `<a href="${config.publicConfig.url}/${screenName}" class="mention">@${screenName}</a>`;
		}).replace(/(\r\n|\r|\n)/g, '<br>');
	} else {
		marked.setOptions({
			gfm: true,
			breaks: true,
			sanitize: true
		});
		text = marked(text).replace(/@([a-zA-Z0-9\-]+)/g, (arg: string, screenName: string) => {
			return `<a href="${config.publicConfig.url}/${screenName}" class="mention">@${screenName}</a>`;
		});
	}
	return text;
}
