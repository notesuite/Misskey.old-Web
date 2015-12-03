require '../../common/scripts/ui.js'
$ = require 'jquery'
Timeline = require '../../common/scripts/timeline-core.js'
notification-compiler = require '../../common/views/notification/smart/render.jade'
notifications-compiler = require '../../common/views/notification/smart/items.jade'
recommendation-users-compiler = require '../../common/views/recommendation-users/users.jade'

$ ->
	try
		Notification.request-permission!
	catch
		console.log 'oops'

	timeline = new Timeline $ '#widget-timeline > .timeline'

	socket = io.connect config.web-streaming-url + '/streaming/sites/desktop/home'

	$ \body .append $ '<p class="streaming-info"><i class="fa fa-spinner fa-spin"></i>ストリームに接続しています...</p>'

	socket.on \connect ->
		$ 'body > .streaming-info' .remove!
		$message = $ '<p class="streaming-info"><i class="fa fa-check"></i>ストリームに接続しました</p>'
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
			$message = $ '<p class="streaming-info reconnecting"><i class="fa fa-spinner fa-spin"></i>ストリームから切断されました 再接続中...</p>'
			$ \body .append $message

	socket.on \notification (notification) ->
		$ '#widget-notifications .notification-empty' .remove!

		$notification = $ notification-compiler {
			notification
			config: CONFIG
			me: ME
		} .hide!
		$notification.prepend-to ($ '#widget-notifications .notifications') .show 200

	socket.on \post (post) ->
		timeline.add post
		$ '#widget-timeline > .timeline > .empty' .remove!

	socket.on \mention (post) ->
		id = post.id
		name = post.user.name
		sn = post.user.screen-name
		text = post.text
		n = new Notification name, {
			body: text
			icon: post.user.avatar-url
		}
		n.onshow = ->
			set-timeout ->
				n.close!
			, 10000ms
		n.onclick = ->
			window.open "#{config.url}/#{sn}/#{id}"

	socket.on \talk-message (message) ->
		console.log \talk-message message
		window-id = 'misskey-window-talk-' + message.user.id
		if $('#' + window-id).0
			return
		n = new Notification message.user.name, {
			body: message.text,
			icon: message.user.avatar-url
		}
		n.onshow = ->
			set-timeout ->
				n.close!
			, 10000ms
		n.onclick = ->
			url = config.url + '/widget/talk/' + message.user.screen-name
			$content = $ '<iframe>' .attr {
				src: url
				+seamless
			}
			open-window do
				window-id
				$content
				'<i class="fa fa-comments"></i>' + escapeHTML message.user.name
				300
				450
				true
				url

	# Read more
	$ window .scroll ->
		me = $ @
		current = $ window .scroll-top! + window.inner-height
		if current > $ document .height! - 32
			if not me.data \loading
				me.data \loading yes
				$.ajax "#{config.web-api-url}/posts/timeline" {
					data:
						limit: 10
						'max-cursor': $ '#widget-timeline .timeline > .posts > .post:last-child' .attr \data-cursor}
				.done (posts) ->
					me.data \loading no
					posts.for-each (post) ->
						timeline.add-last post
				.fail (data) ->
					me.data \loading no

	# 通知読み込み
	$.ajax "#{config.web-api-url}/notifications/timeline"
	.done (notifications) ->
		if notifications != []
			$notifications = $ notifications-compiler {
				items: notifications
				config: CONFIG
				me: ME
			}
			$notifications.append-to $ '#widget-notifications .notifications'
		else
			$info = $ '<p class="notifications-empty">通知はありません</p>'
			$info.append-to $ '#widget-notifications'

	# recommendation users
	$.ajax "#{config.web-api-url}/users/recommendations"
	.done (users) ->
		if users != []
			$users = $ recommendation-users-compiler {
				users
				config: CONFIG
				me: ME
			}
			$users.append-to $ '#widget-recommendation-users'
			$users.each ->
				$user = $ @
				$user.find \.follow-button .click ->
					$user.remove!
					$.ajax "#{config.web-api-url}/users/follow" {
						data: { 'user-id': $user.attr \data-user-id }
					}
