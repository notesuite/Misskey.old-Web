/**
 * waves-effect.js
 *
 * @version  0.0.0
 * @url https://github.com/syuilo/waves-effect
 *
 * Copyright 2015-2016 syuilo.
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

	function distance(p, q) {
		var sqrt = Math.sqrt, pow = Math.pow;
		return sqrt(pow(p.x - q.x, 2) + pow(p.y - q.y, 2));
	}

	function calcCircleScale(boxW, boxH, circleCenterX, circleCenterY) {
		var origin = {x: circleCenterX, y: circleCenterY};
		var dist1 = distance({x: 0, y: 0}, origin);
		var dist2 = distance({x: boxW, y: 0}, origin);
		var dist3 = distance({x: 0, y: boxH}, origin);
		var dist4 = distance({x: boxW, y: boxH }, origin);
		return Math.max(dist1, dist2, dist3, dist4) * 2;
	}

	function init(elem) {
		Array.prototype.forEach.call(elem.children, function(child) {
			if (window.getComputedStyle(child).getPropertyValue('position') == 'static') {
				child.style.position = 'relative';
			}
		});

		elem.addEventListener('mousedown', function(event) {
			var target = event.target;
			var rect = target.getBoundingClientRect();
			var positionX = rect.left;
			var positionY = rect.top;
			var targetX = positionX;
			var targetY = positionY;

			target.style.position = 'relative';

			var rippleContainer = document.createElement('div');
			rippleContainer.className = 'waveseffect-ripple-container';
			rippleContainer.style.position = 'absolute';
			rippleContainer.style.top = '0';
			rippleContainer.style.left = '0';
			rippleContainer.style.width = target.clientWidth.toString() + 'px';
			rippleContainer.style.height = target.clientHeight.toString() + 'px';
			rippleContainer.style.overflow = 'hidden';
			rippleContainer.style.pointerEvents = 'none';

			var ripple = document.createElement('div');
			ripple.className = 'waveseffect-ripple';
			ripple.style.position = 'absolute';
			ripple.style.top = (event.clientY - targetY - 1).toString() + 'px';
			ripple.style.left = (event.clientX - targetX - 1).toString() + 'px';
			ripple.style.width = '2px';
			ripple.style.height = '2px';
			ripple.style.borderRadius = '100%';
			ripple.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
			ripple.style.opacity = '1';
			ripple.style.transform = 'scale(1, 1)';
			ripple.style.transition = 'all 0.7s cubic-bezier(0, .5, .5, 1)';

			rippleContainer.appendChild(ripple);

			target.insertBefore(rippleContainer, target.firstChild);

			var boxW = target.clientWidth;
			var boxH = target.clientHeight;
			var circleCenterX = event.clientX - targetX;
			var circleCenterY = event.clientY - targetY;

			var scale = calcCircleScale(boxW, boxH, circleCenterX, circleCenterY);

			setTimeout(function() {
				ripple.style.transform = 'scale(' + (scale / 2) + ', ' + (scale / 2) + ')';
			}, 1);
			setTimeout(function() {
				ripple.style.transition = 'all 1s ease';
				ripple.style.opacity = '0';
			}, 1000);
			setTimeout(function() {
				target.removeChild(rippleContainer);
			}, 2000);
		}, false);
	}

	WavesEffect.attachToClass = function(className) {
		var attachees = document.getElementsByClassName(className);
		Array.prototype.forEach.call(attachees, init);
	};

	return WavesEffect;
});
