console.log('Welcome to Misskey!');

// Imports
import$(global, require('prelude-ls'));
import$(global, require('./utils/json'));
import$(global, require('./utils/null-or-empty'));
import$(global, require('./utils/mongoose-query'));
function import$(obj: any, src: any){
	var own = {}.hasOwnProperty;
	for (var key in src) if (own.call(src, key)) obj[key] = src[key];
	return obj;
}

// Create server
require('./server');
