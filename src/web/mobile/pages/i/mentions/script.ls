require '../../../common/scripts/ui.js'
$ = require 'jquery/dist/jquery'
Timeline = require '../../../common/scripts/timeline-core.js'

function delete-all
	$.ajax "#{CONFIG.web-api-url}/posts/mentions/delete-all"
	.done ->
		$ '#misskey-header .delete i' .attr \class 'fa fa-trash-o'
		alert '削除しました。'
		location.reload!
	.fail ->
		$ '#misskey-header .delete i' .attr \class 'fa fa-trash'
		alert '削除に失敗しました。再度お試しください。'

$ ->
	timeline = new Timeline $ '#stream'

	$ '#misskey-header .delete' .click ->
		$ '#misskey-header .delete i' .attr \class 'fa fa-spinner fa-spin'
		if window.confirm 'すべてのあなた宛ての投稿の通知を削除しますか？'
			$.ajax "#{CONFIG.web-api-url}/notifications/unread/count"
			.done (count) ->
				if count != 0
					if window.confirm '未読のあなた宛ての投稿の通知があるようですが、それでもすべて削除しますか？'
						delete-all!
					else
						$ '#misskey-header .delete i' .attr \class 'fa fa-trash'
				else
					delete-all!
			.fail ->
				$ '#misskey-header .delete i' .attr \class 'fa fa-trash'
				alert '削除の準備に失敗しました。再度お試しください。'

	$ '#stream > .read-more' .click ->
		$button = $ @
		$button.attr \disabled on
		$button.find \i .attr \class 'fa fa-spinner fa-spin'
		$button.find \p .text '読み込んでいます...'
		$.ajax "#{CONFIG.web-api-url}/posts/mentions/show" {
			data:
				limit: 20
				'max-cursor': $ '#stream > .posts > .post:last-child' .attr \data-cursor
		} .done (posts) ->
			posts.for-each (post) ->
				timeline.add-last post
		.always ->
			$button.attr \disabled off
			$button.find \i .attr \class 'fa fa-sort-amount-desc'
			$button.find \p .text 'もっと読み込む'
