require '../common/ui.js'
$ = require 'jquery'
Timeline = require '../common/timeline-core.js'

$ ->
	try
		Notification.request-permission!
	catch
		console.log 'oops'

	timeline = new Timeline $ '#widget-timeline > .timeline'

	/*
	# オートセーブがあるなら復元
	if $.cookie \post-autosave
		$ '#post-form textarea' .val $.cookie \post-autosave
	*/

	socket = io.connect config.web-streaming-url + '/streaming/home'

	$ \body .append $ '<p class="streaming-info"><i class="fa fa-spinner fa-spin"></i>ストリームに接続しています...</p>'

	socket.on \connect ->
		console.log 'Connected'
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
		console.log \notification notification

		$ '#widget-notifications .notification-empty' .remove!

		$notification = ($ notification).hide!
		$notification.prepend-to ($ '#widget-notifications .notifications') .show 200

	socket.on \post (post) ->
		timeline.add $ post
		$ '#widget-timeline > .timeline > .empty' .remove!

	socket.on \reply (status) ->
		console.log \reply status

		id = status.id
		name = status.user-name
		sn = status.user-screen-name
		text = status.text
		n = new Notification name, {
			body: text
			icon: status.user.avatar-url
		}
		n.onshow = ->
			set-timeout ->
				n.close!
			, 10000ms
		n.onclick = ->
			window.open "#{conf.url}/#{sn}/status/#{id}"

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
				$.ajax "#{config.web-api-url}/web/sites/desktop/home/posts/timeline" {
					type: \get
					data:
						limit: 20
						'max-cursor': $ '#widget-timeline .timeline > .posts > .post:last-child' .attr \data-cursor
					data-type: \text
					xhr-fields: {+with-credentials}}
				.done (data) ->
					me.data \loading no
					$posts = $ data
					$posts.each ->
						timeline.add-last $ @
				.fail (data) ->
					me.data \loading no

	$ '#recommendation-users > .users > .user' .each ->
		$user = $ @
		$user.find \.follow-button .click ->
			$button = $ @
			$button.attr \disabled yes

			if ($user.attr \data-is-following) == \true
				$.ajax config.web-api-url + '/users/unfollow' {
					type: \delete
					data: { 'user-id': $user.attr \data-user-id }
					data-type: \json
					xhr-fields: {+with-credentials}
				} .done ->
					$button.attr \disabled no
					$button.remove-class \following
					$button.add-class \notFollowing
					$button.text 'フォロー'
					$user.attr \data-is-following \false
				.fail ->
					$button.attr \disabled no
			else
				$.ajax config.web-api-url + '/users/follow' {
					type: \post
					data: { 'user-id': $user.attr \data-user-id }
					data-type: \json
					xhr-fields: {+with-credentials}
				} .done ->
					$button.attr \disabled no
					$button.remove-class \notFollowing
					$button.add-class \following
					$button.text 'フォロー解除'
					$user.attr \data-is-following \true
				.fail ->
					$button.attr \disabled no

	# 通知読み込み
	$.ajax "#{config.web-api-url}/web/sites/desktop/home/notifications" {
		type: \get
		data: {}
		data-type: \text
		xhr-fields: {+with-credentials}}
	.done (data) ->
		if data != ''
			$notifications = $ data
			$notifications.append-to $ '#widget-notifications .notifications'
		else
			$info = $ '<p class="notifications-empty">通知はありません</p>'
			$info.append-to $ '#widget-notifications'

	# recommendation users
	$.ajax "#{config.web-api-url}/web/sites/desktop/home/recommendation-users" {
		type: \get
		data: {}
		data-type: \text
		xhr-fields: {+with-credentials}}
	.done (data) ->
		if data != ''
			$users = $ data
			$users.append-to $ '#widget-recommendation-users'
