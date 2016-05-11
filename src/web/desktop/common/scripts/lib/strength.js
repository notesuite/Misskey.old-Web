/**
 * strength.js
 *
 * @version  0.0.0
 * @url https://github.com/syuilo/strength.js
 *
 * Copyright 2016 syuilo.
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
		window.WavesEffect = definition();
	}
})(function() {
	'use strict';

	return function(source) {
		var strength = 0;
		var power = 0.018;

		// 英数字
		if (/[a-zA-Z]/.test(source) && /[0-9]/.test(source)) {
			power += 0.020;
		}

		// 大文字と小文字が混ざってたら
		if (/[a-z]/.test(source) && /[A-Z]/.test(source)) {
			power += 0.015;
		}

		// 記号が混ざってたら
		if (/[!\x22\#$%&@'()*+,-./_]/.test(source)) {
			power += 0.02;
		}

		strength = power * source.length;

		if (strength < 0) {
			strength = 0;
		}

		if (strength > 1) {
			strength = 1;
		}

		return strength;
	};
});
