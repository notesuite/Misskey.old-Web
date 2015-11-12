/**
 * ogper.js
 *
 * @version  0.0.0
 * @url https://github.com/syuilo/ogper
 *
 * Copyright 2015 syuilo.
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

(function(definition) {
	'use strict';

	// CommonJS
	if (typeof exports === 'object') {
		module.exports = definition();

	// RequireJS
	} else if (typeof define === 'function' && define.amd) {
		define(definition);

	// <script>
	} else {
		window.OGPer = definition();
	}
})(function() {
	'use strict';

	var OGPer = function OGPer(){};
	
	OGPer.ogp = function(url) {
		
	};

	return OGPer;
});
