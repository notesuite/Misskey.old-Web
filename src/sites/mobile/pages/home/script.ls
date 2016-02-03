require '../../common/scripts/ui.js'
$ = require 'jquery/dist/jquery'
require 'jquery.transit'
Timeline = require '../../common/scripts/timeline-core.js'
notification-render = require '../../common/views/notification/render.jade'
get-post-summary = require '../../../common/get-post-summary'

is-active = yes
unread-count = 0

$ ->
	default-title = document.title

	timeline = new Timeline $ '#timeline'

	$ window .focus ->
		is-active := yes
		unread-count := 0
		document.title = default-title

	$ window .blur ->
		is-active := no

	$ '#timeline > .read-more' .click ->
		$button = $ @
		$button.attr \disabled on
		$button.find \i .attr \class 'fa fa-spinner fa-spin'
		$button.find \.text .text LOCALE.sites.mobile.pages.home.timeline_loading
		$.ajax "#{CONFIG.web-api-url}/posts/timeline" {
			data:
				limit: 20
				'max-cursor': $ '#timeline > .posts > .post:last-child' .attr \data-cursor
		} .done (posts) ->
			posts.for-each (post) ->
				timeline.add-last post
		.always ->
			$button.attr \disabled off
			$button.find \i .attr \class 'fa fa-sort-amount-desc'
			$button.find \.text .text LOCALE.sites.mobile.pages.home.read_more

	socket = io.connect "#{CONFIG.web-streaming-url}/streaming/home"

	$ \body .append $ "<p class=\"streaming-info\"><i class=\"fa fa-spinner fa-spin\"></i>#{LOCALE.sites.mobile.common.connecting_stream}</p>"

	socket.on \connect ->
		$ 'body > .streaming-info' .remove!
		$message = $ "<p class=\"streaming-info\"><i class=\"fa fa-check\"></i>#{LOCALE.sites.mobile.common.connected_stream}</p>"
		$ \body .append $message
		set-timeout ->
			$message.animate {
				opacity: 0
			} 200ms \linear ->
				$message.remove!
		, 1000ms

	socket.on \disconnect (client) ->
		if $ 'body > .streaming-info.reconnecting' .length == 0
			$ 'body > .streaming-info' .remove!
			$message = $ "<p class=\"streaming-info reconnecting\"><i class=\"fa fa-spinner fa-spin\"></i>#{LOCALE.sites.mobile.common.reconnecting_stream}</p>"
			$ \body .append $message

	socket.on \post (post) ->
		timeline.add post
		$ '#timeline > .empty' .remove!

		if not is-active
			unread-count++
			document.title = "(#{unread-count}) #{get-post-summary LANG, post}"

	socket.on \notification (notification) ->
		$notification = $ notification-render {
			notification
			config: CONFIG
			me: ME
			locale: LOCALE
			user-settings: USER_SETTINGS
		}
		$notification.append-to $ \body
			.transition {
				y: $notification.outer-height!
			} 0ms
			.transition {
				y: 0
			} 500ms \ease ->
				set-timeout ->
					$notification.transition {
						y: $notification.outer-height!
					} 500ms \ease ->
						$notification.remove!
				, USER_SETTINGS.pseudo-push-notification-display-duration

	$ '#misskey-header .post' .click ->
		text = window.prompt LOCALE.sites.mobile.pages.home.new_post
		if text? and text != ''
			$.ajax "#{CONFIG.web-api-url}/posts/create" {
				data: {
					type: \text
					text
				}
			} .done (post) ->
				# something
			.fail (data) ->
				error = data.error
				switch error
				| \empty-text => window.alert 'テキストを入力してください。'
				| \too-long-text => window.alert 'テキストが長過ぎます。'
				| \duplicate-content => window.alert '投稿が重複しています。'
				| _ => window.alert "不明なエラー (#error-code)"
