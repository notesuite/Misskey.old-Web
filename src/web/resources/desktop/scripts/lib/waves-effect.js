/**
 * waves-effect.js
 *
 * @version  0.0.0
 * @url https://github.com/syuilo/waves-effect
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
		window.WavesEffect = definition();
	}
})(function() {
	'use strict';

	var WavesEffect = function WavesEffect(){};

	WavesEffect.attachToClass = function(className) {
		var attachees = document.getElementsByClassName(className);
		Array.prototype.forEach.call(attachees, function(attachee) {
			attachee.addEventListener('mousedown', function(event) {
				event.target.style.position = 'relative';
				var rippleContainer = document.createElement('div');
				rippleContainer.className = 'waveseffect-ripple-container';
				rippleContainer.style.position = 'absolute';
				rippleContainer.style.zIndex = '-1';
				rippleContainer.style.top = '0';
				rippleContainer.style.left = '0';
				rippleContainer.style.width = event.target.clientWidth.toString() + 'px';
				rippleContainer.style.height = event.target.clientHeight.toString() + 'px';
				rippleContainer.style.overflow = 'hidden';
				rippleContainer.style.pointerEvents = 'none';
				// rippleContainer.style.backgroundColor = 'red';
				var ripple = document.createElement('div');
				ripple.className = 'waveseffect-ripple';
				ripple.style.position = 'absolute';
				ripple.style.top = (event.pageY - event.target.offsetTop - 1).toString() + 'px';
				ripple.style.left = (event.pageX - event.target.offsetLeft - 1).toString() + 'px';
				ripple.style.width = '2px';
				ripple.style.height = '2px';
				ripple.style.borderRadius = '100%';
				ripple.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
				ripple.style.opacity = '1';
				ripple.style.transform = 'scale(1, 1)';
				ripple.style.transition = 'all 1.5s cubic-bezier(0, .5, .5, 1)';
				rippleContainer.appendChild(ripple);
				event.target.appendChild(rippleContainer);
				
				var boxW = event.target.clientWidth;
				var boxH = event.target.clientHeight;
				var circleX = event.pageX - event.target.offsetLeft;
				var circleY = event.pageY - event.target.offsetTop;
				
				var zure = Math.pow((circleX - (boxW / 2)) * (circleX - (boxW / 2)) + (circleY - (boxH / 2)) * (circleY - (boxH / 2)), 0.5);
				var scale = (Math.max(boxW, boxH) * Math.sqrt(2)) + (zure * Math.sqrt(2) * Math.sqrt(2));
				
				setTimeout(function() {
					ripple.style.transform = 'scale(' + (scale / 2) + ', ' + (scale / 2) + ')';
				}, 1);
				setTimeout(function() {
					ripple.style.transition = 'all 1.5s ease';
					ripple.style.opacity = '0';
				}, 1500);
				setTimeout(function() {
					event.target.removeChild(rippleContainer); 
				}, 3000);
			}, false);
		});
	};

	return WavesEffect;
});
