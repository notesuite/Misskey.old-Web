require '../../../common/scripts/ui.js'
$ = require 'jquery'
require 'Swiper'
Timeline = require '../../../common/scripts/timeline-core.js'

$ ->
	is-me = LOGIN and ME.id == USER.id

	window.is-following = if LOGIN then USER.is-following else null

	timeline = new Timeline $ '#timeline'

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

	$ '#timeline > .read-more' .click ->
		$button = $ @
		$button.attr \disabled on
		$button.find \i .attr \class 'fa fa-spinner fa-spin'
		$button.find \p .text '読み込んでいます...'
		$.ajax "#{CONFIG.web-api-url}/posts/user-timeline" {
			data:
				limit: 20
				'user-id': USER.id
				'max-cursor': $ '#timeline > .posts > .post:last-child' .attr \data-cursor
		} .done (posts) ->
			posts.for-each (post) ->
				timeline.add-last post
		.always ->
			$button.attr \disabled off
			$button.find \i .attr \class 'fa fa-sort-amount-desc'
			$button.find \p .text 'もっと読み込む'
