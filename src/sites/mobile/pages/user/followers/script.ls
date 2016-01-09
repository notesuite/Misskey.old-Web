require '../base.js'
$ = require 'jquery'
UsersList = require '../../../common/widgets/users-list/script.js'

$ ->
	users-list = new UsersList $ \#followers

	$ '#followers > .read-more' .click ->
		$button = $ @
		$button.attr \disabled on
		$button.find \i .attr \class 'fa fa-spinner fa-spin'
		$button.find \p .text '読み込んでいます...'
		$.ajax "#{CONFIG.web-api-url}/users/followers" {
			data:
				limit: 20
				'user-id': USER.id
				'max-cursor': $ '#followers > .users > .user:last-child' .attr \data-cursor
		} .done (users) ->
			users.for-each (user) ->
				users-list.add user
		.always ->
			$button.attr \disabled off
			$button.find \i .attr \class 'fa fa-sort-amount-desc'
			$button.find \p .text 'もっと読み込む'
