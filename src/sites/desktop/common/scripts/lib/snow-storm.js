/*
 * (c) syuilo 2015
 */

var $ = require('jquery');

$(function() {
	$('html').css('overflow-x', 'hidden');

	function setSnow(top, left) {
		if ($('body').children('.snow').length < 50) {
			var r = Math.random();
			var size = Math.floor(2 + (r * 4));
			var $snow = $('<div/>');
			$snow.attr({
				'class': 'snow',
				'data-speed': r,
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
			});
			$('body').append($snow);
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
		$('body').children('.snow').each(function() {
			var windowWidth = $(window).width(), windowHeight = $(window).height();

			var $snow = $(this);
			var snowOffset = $snow.offset();
			var speed = parseFloat($snow.attr('data-speed'));
			var wind = ((windowWidth / 2) - (parseFloat($('html').attr('cursorX')))) / (300 - (speed * 260));
			var swing = Math.sin(snowOffset.top / (100 * speed)) * speed;

			var top = snowOffset.top + (1 + (speed * 6));
			var left = snowOffset.left + wind + swing;

			if (left > windowWidth || left < 0) { // 左右にはみ出した時
				$snow.remove();
			} else if (top < $(window).scrollTop()) { // 上にはみ出した時
				$snow.remove();
			} else if ((top + $snow.height()) > $(window).scrollTop() + windowHeight) { // 地面についた時
				$snow.remove();
			} else {
				$snow.css({
					'top' : top + 'px',
					'left' : left + 'px',
				});
			}
		});
	}, 50);
});
