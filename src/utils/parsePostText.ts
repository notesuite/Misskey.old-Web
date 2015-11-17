const marked: any = require('marked');

export default function(text: string, isPlain: boolean): string {
	'use strict';
	if (text === null) {
		return null;
	}
	if (!isPlain) {
		marked.setOptions({
			gfm: true,
			breaks: true,
			sanitize: true
		});
		text = marked(text);
	}
	return text;
}
