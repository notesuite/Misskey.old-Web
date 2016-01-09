require '../../../common/scripts/ui.js'
$ = require 'jquery/dist/jquery'
notification-compiler = require '../../../common/views/notification/render.jade'

function delete-all
	$ '#misskey-header .delete i' .attr \class 'fa fa-spinner fa-spin'

	$.ajax "#{CONFIG.web-api-url}/notifications/delete-all"
	.done ->
		$ '#misskey-header .delete i' .attr \class 'fa fa-trash-o'
		alert '削除しました。'
		location.reload!
	.fail ->
		$ '#misskey-header .delete i' .attr \class 'fa fa-trash'
		alert '削除に失敗しました。再度お試しください。'

$ ->
	$ '#misskey-header .delete' .click ->
		if window.confirm 'すべての通知を削除しますか？'
			$.ajax "#{CONFIG.web-api-url}/notifications/unread/count"
			.done (count) ->
				if count != 0
					if window.confirm '未読の通知があるようですが、それでもすべて削除しますか？'
						delete-all!
				else
					delete-all!
			.fail ->
				alert '削除の準備に失敗しました。再度お試しください。'

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
