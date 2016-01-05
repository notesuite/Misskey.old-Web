require '../../../common/scripts/ui.js'
$ = require 'jquery'
notification-compiler = require '../../../common/views/notification/render.jade'

$ ->
	$ '#stream > .read-more' .click ->
		$button = $ @
		$button.attr \disabled on
		$button.find \i .attr \class 'fa fa-spinner fa-spin'
		$button.find \p .text '読み込んでいます...'
		$.ajax "#{CONFIG.web-api-url}/notifications/timeline" {
			data:
				limit: 20
				'max-cursor': $ '#stream > .notifications > .notification:last-child' .attr \data-cursor
		} .done (notifications) ->
			notifications.for-each (notification) ->
				$notification = $ notification-compiler {
					notification
					config: CONFIG
					me: ME
					user-settings: USER_SETTINGS
				}
				$notification.append-to $ '#stream > .notifications'
		.always ->
			$button.attr \disabled off
			$button.find \i .attr \class 'fa fa-sort-amount-desc'
			$button.find \p .text 'もっと読み込む'
