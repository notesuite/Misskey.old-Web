const markdown: any = require('markdown').markdown;

export default function(text: string, isPlain: boolean): string {
	'use strict';
	if (!isPlain) {
		text = markdown.toHTML(text);
	}
	return text;
}
