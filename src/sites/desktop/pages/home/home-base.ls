require '../../common/scripts/ui.js'
$ = require 'jquery'
moment = require 'moment'
Timeline = require '../../common/scripts/timeline-core.js'
notification-compiler = require '../../common/views/notification/smart/render.jade'
notifications-compiler = require '../../common/views/notification/smart/items.jade'
recommendation-users-compiler = require '../../common/views/recommendation-users/users.jade'

is-active = yes
unread-count = 0

timeline = null
timeline-loading = no

module.exports = (type) ->
	$ ->
		try
			Notification.request-permission!
		catch
			console.log 'oops'

		default-title = document.title

		timeline := new Timeline $ '#widget-timeline > .timeline'

		$ document .keydown (e) ->
			tag = e.target.tag-name.to-lower-case!
			if tag != \input and tag != \textarea
				if e.which == 84 # t
					$ '#widget-timeline > .timeline > .posts > .post:first-child' .focus!

		$ window .focus ->
			is-active := yes
			unread-count := 0
			document.title = default-title

		$ window .blur ->
			is-active := no

		# Read more automatically
		if USER_SETTINGS.read-timeline-automatically
			$ window .scroll ->
				current = $ window .scroll-top! + window.inner-height
				if current > $ document .height! - 32
					read-more!

		init-stream!
		init-widgets!

	function read-more
		if not timeline-loading
			timeline-loading := yes
			endpoint = switch (type)
				| \home => "#{CONFIG.web-api-url}/posts/timeline"
				| \mentions => "#{CONFIG.web-api-url}/posts/mentions"
			$.ajax endpoint, {
				data:
					limit: 10
					'max-cursor': $ '#widget-timeline .timeline > .posts > .post:last-child' .attr \data-cursor}
			.done (posts) ->
				posts.for-each (post) ->
					timeline.add-last post
			.fail (data) ->
			.always ->
				timeline-loading := no

	function init-stream
		$ \body .append $ '<p class="streaming-info"><i class="fa fa-spinner fa-spin"></i>ストリームに接続しています...</p>'

		socket = io.connect CONFIG.web-streaming-url + '/streaming/' + type

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

		switch type
			| \home => init-home-stream-socket!

		function init-home-stream-socket
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

				if not is-active
					unread-count++
					document.title = "(#{unread-count}) " + $ '#widget-timeline > .timeline > .posts > .post:first-child > .main > .content > .text' .text!

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
					window.open "#{CONFIG.url}/#{sn}/#{id}"

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
					url = CONFIG.url + '/widget/talk/' + message.user.screen-name
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

function init-widgets
	if $ \#widget-notifications .length != 0
		# 通知読み込み
		$.ajax "#{CONFIG.web-api-url}/notifications/timeline"
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

	if $ \#widget-recommendation-users .length != 0
		# recommendation users
		$.ajax "#{CONFIG.web-api-url}/users/recommendations"
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
						$.ajax "#{CONFIG.web-api-url}/users/follow" {
							data: { 'user-id': $user.attr \data-user-id }
						}

	if $ \#widget-big-calendar .length != 0
		$ \#widget-big-calendar .find \.day-of-the-week .text  moment!.format 'dddd'
		$ \#widget-big-calendar .find \.day .text  moment!.format 'Do'
		$ \#widget-big-calendar .find \.month .text  moment!.format 'MMMM'
		$ \#widget-big-calendar .find \.year .text  moment!.format 'YYYY'

	if $ \#widget-small-calendar .length != 0
		$ \#widget-small-calendar .find \.yyyy .text  moment!.format 'YYYY'
		$ \#widget-small-calendar .find \.m .text  moment!.format 'M'
		$ \#widget-small-calendar .find \.d .text  moment!.format 'D'
		$ \#widget-small-calendar .find \.week .text  moment!.format 'dddd'

	if $ \#widget-big-analog-clock .length != 0
		update-clock = ->
			s = (new Date!).get-seconds!
			m = (new Date!).get-minutes!
			h = (new Date!).get-hours!

			vec2 = (x, y) ->
				@.x = x
				@.y = y

			canvas = document.get-element-by-id \widget-big-analog-clock-canvas
			ctx = canvas.get-context \2d
			canv-w = canvas.width
			canv-h = canvas.height
			ctx.clear-rect 0, 0, canv-w, canv-h

			center = (Math.min (canv-w / 2), (canv-h / 2))
			line-start = center * 0.90
			line-end-short = center * 0.87
			line-end-long = center * 0.84
			for i from 0 to 59 by 1
				angle = Math.PI * i / 30
				uv = new vec2 (Math.sin angle), (-Math.cos angle)
				ctx.begin-path!
				ctx.line-width = 1
				ctx.move-to do
					(canv-w / 2) + uv.x * line-start
					(canv-h / 2) + uv.y * line-start
				if i % 5 == 0
					ctx.stroke-style = 'rgba(0, 0, 0, 0.2)'
					ctx.line-to do
						(canv-w / 2) + uv.x * line-end-long
						(canv-h / 2) + uv.y * line-end-long
				else
					ctx.stroke-style = 'rgba(0, 0, 0, 0.1)'
					ctx.line-to do
						(canv-w / 2) + uv.x * line-end-short
						(canv-h / 2) + uv.y * line-end-short
				ctx.stroke!

			angle = Math.PI * (m + s / 60) / 30
			length = (Math.min canv-w, canv-h) / 2.6
			uv = new vec2 (Math.sin angle), (-Math.cos angle)
			ctx.begin-path!
			ctx.stroke-style = \#000000
			ctx.line-width = 2
			ctx.move-to do
				(canv-w / 2) - uv.x * length / 5
				(canv-h / 2) - uv.y * length / 5
			ctx.line-to do
				(canv-w / 2) + uv.x * length
				(canv-h / 2) + uv.y * length
			ctx.stroke!

			angle = Math.PI * (h % 12 + m / 60) / 6
			length = (Math.min canv-w, canv-h) / 4
			uv = new vec2 (Math.sin angle), (-Math.cos angle)
			ctx.begin-path!
			ctx.stroke-style = $ '#widget-big-analog-clock' .attr \data-user-color
			ctx.line-width = 2
			ctx.move-to do
				(canv-w / 2) - uv.x * length / 5
				(canv-h / 2) - uv.y * length / 5
			ctx.line-to do
				(canv-w / 2) + uv.x * length
				(canv-h / 2) + uv.y * length
			ctx.stroke!

			angle = Math.PI * s / 30
			length = (Math.min canv-w, canv-h) / 2.6
			uv = new vec2 (Math.sin angle), (-Math.cos angle)
			ctx.begin-path!
			ctx.stroke-style = 'rgba(0, 0, 0, 0.5)'
			ctx.line-width = 1
			ctx.move-to do
				(canv-w / 2) - uv.x * length / 5
				(canv-h / 2) - uv.y * length / 5
			ctx.line-to do
				(canv-w / 2) + uv.x * length
				(canv-h / 2) + uv.y * length
			ctx.stroke!

		update-clock!
		set-interval update-clock, 1000ms

	if $ \#widget-small-analog-clock .length != 0
		update-clock = ->
			s = (new Date!).get-seconds!
			m = (new Date!).get-minutes!
			h = (new Date!).get-hours!

			vec2 = (x, y) ->
				@.x = x
				@.y = y

			canvas = document.get-element-by-id \widget-small-analog-clock-canvas
			ctx = canvas.get-context \2d
			canv-w = canvas.width
			canv-h = canvas.height
			ctx.clear-rect 0, 0, canv-w, canv-h

			angle = Math.PI * (m + s / 60) / 30
			length = (Math.min canv-w, canv-h) / 2.6
			uv = new vec2 (Math.sin angle), (-Math.cos angle)
			ctx.begin-path!
			ctx.stroke-style = \#000000
			ctx.line-width = 2
			ctx.move-to do
				(canv-w / 2) - uv.x * length / 5
				(canv-h / 2) - uv.y * length / 5
			ctx.line-to do
				(canv-w / 2) + uv.x * length
				(canv-h / 2) + uv.y * length
			ctx.stroke!

			angle = Math.PI * (h % 12 + m / 60) / 6
			length = (Math.min canv-w, canv-h) / 4
			uv = new vec2 (Math.sin angle), (-Math.cos angle)
			ctx.begin-path!
			ctx.stroke-style = $ '#widget-small-analog-clock' .attr \data-user-color
			ctx.line-width = 2
			ctx.move-to do
				(canv-w / 2) - uv.x * length / 5
				(canv-h / 2) - uv.y * length / 5
			ctx.line-to do
				(canv-w / 2) + uv.x * length
				(canv-h / 2) + uv.y * length
			ctx.stroke!

			angle = Math.PI * s / 30
			length = (Math.min canv-w, canv-h) / 2.6
			uv = new vec2 (Math.sin angle), (-Math.cos angle)
			ctx.begin-path!
			ctx.stroke-style = 'rgba(0, 0, 0, 0.5)'
			ctx.line-width = 1
			ctx.move-to do
				(canv-w / 2) - uv.x * length / 5
				(canv-h / 2) - uv.y * length / 5
			ctx.line-to do
				(canv-w / 2) + uv.x * length
				(canv-h / 2) + uv.y * length
			ctx.stroke!

		update-clock!
		set-interval update-clock, 1000ms
