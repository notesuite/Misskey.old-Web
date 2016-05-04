require '../../common/scripts/ui.ls'
$ = require 'jquery'
require 'Swiper'

$ ->
	is-me = LOGIN and ME.id == USER.id

	window.is-following = if LOGIN then USER.is-following else null

	swiper = new Swiper \.swiper-container {
		direction: \horizontal
		loop: true
		pagination: \.swiper-pagination
	}

	$ '#friend-button' .click ->
		$button = $ @
			..attr \disabled on
		if window.is-following
			$.ajax "#{CONFIG.web-api-url}/users/unfollow" {
				data: {'user-id': USER.id}}
			.done ->
				$button .remove-class \danger
				$button
					..attr \disabled off
					..remove-class \following
					..add-class \not-following
					..find \.text .text 'フォロー'
					..find \i .attr \class 'fa fa-plus'
				window.is-following = false
			.fail ->
				$button.attr \disabled off
		else
			$.ajax "#{CONFIG.web-api-url}/users/follow" {
				data: {'user-id': USER.id}}
			.done ->
				$button
					..attr \disabled off
					..remove-class \not-following
					..add-class \following
					..find \.text .text 'フォロー解除'
					..find \i .attr \class 'fa fa-minus-circle'
				window.is-following = true
			.fail ->
				$button.attr \disabled off
