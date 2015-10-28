import * as jade from 'jade';

export default function(templatePath: string, key: string, values: Object[]): string {
	'use strict';
	// 型定義間違ってませんか？
	const compiler: (locals?: any) => string = (<any>jade).compileFile(templatePath);
	return values.map((value: Object) => {
		const args: any = {};
		args[key] = value;
		return compiler(args);
	}).join();
}
