require '../base.js'
$ = require 'jquery/dist/jquery'
Timeline = require '../../../common/scripts/timeline-core.js'

$ ->
	timeline = new Timeline $ '#timeline'

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
