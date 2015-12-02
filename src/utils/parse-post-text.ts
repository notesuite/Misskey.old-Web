const escapeHtml: any = require('escape-html');

import config from '../config';

export default function parsePostText(text: string, isPlain: boolean): string {
	'use strict';
	if (text === null) {
		return null;
	}
	text = analyzeHashtags(analyzeMentions(escapeHtml(text).replace(/https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+/g, (url: string) => {
		return `<a href="${url}" target="_blank" class="url">${url}</a>`;
	}))).replace(/(\r\n|\r|\n)/g, '<br>');
	return text;
}

function analyzeMentions(text: string): string {
	'use strict';
	return text.replace(/@([a-zA-Z0-9\-]+)/g, (arg: string, screenName: string) => {
		return `<a href="${config.publicConfig.url}/${screenName}" class="mention">@${screenName}</a>`;
	});
}

function analyzeHashtags(text: string): string {
	'use strict';
	return text.replace(/#(\S+)/g, (arg: string, tag: string) => {
		return `<a href="${config.publicConfig.url}/search/hashtag:${tag}" class="hashtag">#${tag}</a>`;
	});
}
