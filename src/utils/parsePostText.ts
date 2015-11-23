const marked: any = require('marked');
const escapeHtml: any = require('escape-html');

import config from '../config';

export default function parsePostText(text: string, isPlain: boolean): string {
	'use strict';
	if (text === null) {
		return null;
	}
	if (isPlain) {
		text = analyzeHashtags(analyzeMentions(escapeHtml(text).replace(/https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+/g, (url: string) => {
			return `<a href="${url}" target="_blank" class="url">${url}</a>`;
		}))).replace(/(\r\n|\r|\n)/g, '<br>');
	} else {
		marked.setOptions({
			gfm: true,
			breaks: true,
			sanitize: true
		});
		text = analyzeHashtags(analyzeMentions(marked(text)));
	}
	return text;
}

function analyzeMentions(text: string): string {
	return text.replace(/@([a-zA-Z0-9\-]+)/g, (arg: string, screenName: string) => {
		return `<a href="${config.publicConfig.url}/${screenName}" class="mention">@${screenName}</a>`;
	});
}

function analyzeHashtags(text: string): string {
	return text.replace(/#(\S+)/g, (arg: string, tag: string) => {
		return `<a href="${config.publicConfig.url}/search/hashtag:${tag}" class="hashtag">#${tag}</a>`;
	});
}

