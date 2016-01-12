const jade: any = require('jade');

export default function mapToHtml(templatePath: string, key: string, values: Object[], globalValue: Object = {}): string {
	'use strict';
	const compiler: (locals?: any) => string = jade.compileFile(templatePath, {
		filename: 'jade',
		cache: true
	});
	return values.map((value: Object) => {
		const args: any = globalValue;
		args[key] = value;
		return compiler(args);
	}).join('');
}
