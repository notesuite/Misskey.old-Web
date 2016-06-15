//////////////////////////////////////////////////
// ARGV MANAGER
//////////////////////////////////////////////////

import * as argv from 'argv';

argv.option({
	name: 'skip-check-dependencies',
	type : 'string',
	description: '依存関係のチェックをスキップします',
	example: "npm start --skip-check-dependencies"
});

export default argv.run();
