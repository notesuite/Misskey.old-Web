module.exports = function analyze(locale: any, post: any): string {
	switch (post.type) {
	case 'status':
	case 'reply':
		let text = !isEmpty(post.text) ? post.text : '';
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
		throw 'unknown post type';
	}
};

function isEmpty(x: any): boolean {
		return x === undefined || x === null;
}
