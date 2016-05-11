$ = require 'jquery'
user-compiler = require './user-render.jade'

class UsersList
	($list) ->
		THIS = @
		THIS.$list = $list.children '.users'
		THIS.$list.children '.user' .each ->
			$user = $ @
			THIS.init-user $user

	init-user: ($user) ->
		user-id = $user.attr \data-id

		function check-follow
			($user.attr \data-is-following) == \true

		$friend-button = $user.find \.friend-button

		$friend-button.click ->
			$friend-button.attr \disabled on
			if check-follow!
				$.ajax "#{CONFIG.urls.api}/users/unfollow" {
					data: {'user-id': user-id}}
				.done ->
					$friend-button .remove-class \danger
					$friend-button
						..attr \disabled off
						..remove-class \following
						..add-class \not-following
						..find \.text .text 'フォローする'
						..find \i .attr \class 'fa fa-plus'
					$user.attr \data-is-following \false
				.fail ->
					$friend-button.attr \disabled off
			else
				$.ajax "#{CONFIG.urls.api}/users/follow" {
					data: {'user-id': user-id}}
				.done ->
					$friend-button
						..attr \disabled off
						..remove-class \not-following
						..add-class \following
						..find \.text .text 'フォロー解除'
						..find \i .attr \class 'fa fa-minus-circle'
					$user.attr \data-is-following \true
				.fail ->
					$friend-button.attr \disabled off


	add: (user) ->
		THIS = @
		$user = $ user-compiler {
			user: user
			config: CONFIG
			login: LOGIN
			me: ME
			user-settings: USER_SETTINGS
		}
		THIS.$list.append $user

module.exports = UsersList
