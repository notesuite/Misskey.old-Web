const jade: any = require('jade');

export default function(templatePath: string, key: string, values: Object[], grobalValue: Object = {}): string {
	'use strict';
	const compiler: (locals?: any) => string = jade.compileFile(templatePath);
	return values.map((value: Object) => {
		const args: any = grobalValue;
		args[key] = value;
		console.log(args);
		return compiler(args);
	}).join('');
}
