/*
 * (c) syuilo 2015
 */

var $ = require('jquery');

$(function() {
	$('html').css('overflow-x', 'hidden');
	
	var crystals = [];

	function setSnow(top, left) {
		if (crystals.length < 300) {
			var r = Math.random();
			var sizeMin = 2;
			var sizeMax = 6;
			var size = Math.floor(sizeMin + (r * sizeMax));
			var speed = r;

			var $snow = $('<div/>');
			$snow.attr({
				'class': 'snow',
			});
			$snow.css({
				'pointer-events' : 'none',
				'display' : 'block',
				'position' : 'absolute',
				'top' : top + 'px',
				'left' : left + 'px',
				'z-index' : '1024',
				'width' : size + 'px',
				'height' : size + 'px',
				'background' : '#fff',
				'border-radius' : '100%',
				'box-shadow' : '0 0 8px #0ff',
				'opacity' : '1',
				'bottom' : '0px'
			});
			$('body').append($snow);
			
			crystals.push({
				speed: speed,
				size: size,
				$snow: $snow
			});
		}
	}

	// 上エミッター
	setInterval(function() {
		setSnow($(window).scrollTop(), Math.random() * $(window).width());
	}, 300);
	// 左エミッター
	setInterval(function() {
		if (parseFloat($('html').attr('cursorX')) < ($(window).width() / 2)) {
			setSnow($(window).scrollTop() + (Math.random() * $(window).height()), 0);
		}
	}, 600);
	// 右エミッター
	setInterval(function() {
		if (parseFloat($('html').attr('cursorX')) > ($(window).width() / 2)) {
			setSnow($(window).scrollTop() + (Math.random() * $(window).height()), $(window).width());
		}
	}, 600);

	$('html').mousemove(function(e) {
		var x = e.clientX, y = e.clientY;
		$('html').attr('cursorX', x);
	});

	setInterval(function() {
		crystals.forEach(function(crystal, index, object) {
			var windowWidth = $(window).width(), windowHeight = $(window).height();

			var $snow = crystal.$snow;
			var snowOffset = $snow.offset();
			var wind = ((windowWidth / 2) - (parseFloat($('html').attr('cursorX')))) / (300 - (crystal.speed * 260));
			var swing = Math.sin(snowOffset.top / (100 * crystal.speed)) * (crystal.speed * 3);

			var top = snowOffset.top + (1 + (crystal.speed * 6));
			var left = snowOffset.left + wind + swing;

			if (left > windowWidth || left < 0) { // 左右にはみ出した時
				removeCrystal(false);
			} else if (top < $(window).scrollTop()) { // 上にはみ出した時
				removeCrystal(false);
			} else if ((top + $snow.height()) > $(window).scrollTop() + windowHeight) { // 地面についた時
				removeCrystal(false);
			} else {
				$snow.css({
					'top' : top + 'px',
					'left' : left + 'px',
				});
			}
			
			function removeCrystal(pile) {
				object.splice(index, 1);
				console.log((crystal.size / 2) + 'px');
				
				if (pile) {
					$snow.css('transition', 'opacity 30s linear, width 30s linear, bottom 30s linear, left 30s linear');
					
					$snow.css({
						'position': 'fixed',
						'top': '',
						'bottom': (-crystal.size) + 'px',
						'left': (left - (crystal.size / 2)) + 'px',
						'width': (crystal.size * 4) + 'px',
						'opacity': '0'
					});
					
					setTimeout(function() {
						$snow.remove();
					}, 30000);
				} else {
					$snow.remove();
				}
			}
		});
	}, 50);
});
