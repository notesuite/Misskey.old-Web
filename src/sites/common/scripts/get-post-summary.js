module.exports = analyze;

function analyze(locale, post) {
	'use strict';
	switch (post.type) {
		case 'status':
		case 'reply':
			var text = !isEmpty(post.text) ? post.text : '';
			if (!isEmpty(post.files) && post.files.length > 0) {
				if (text !== '') {
					text += ' ';
				}
				switch (locale) {
					case 'ja':
						text += `(${post.files.length}個のファイル)`;
						break;
					default:
						if (post.files.length > 1) {
							text += `(${post.files.length} files)`;
						} else {
							text += `(${post.files.length} file)`;
						}
						break;
				}
			}
			return text;
		case 'repost':
			return `RP ${analyze(locale, post.post)}`;
		default:
			break;
	}
};

function isEmpty(x) {
	'use strict';
	return x === undefined || x === null;
}
