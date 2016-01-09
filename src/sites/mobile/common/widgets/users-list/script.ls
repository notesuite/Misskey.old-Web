$ = require 'jquery'

class UsersList
	($list) ->
		$list.find '.users > .user' .each ->
			$user = $ @
			user-id = $user.attr \data-id

			function check-follow
				($user.attr \data-is-following) == \true

			$friend-button = $user.find '.friend-form .friend-button'

			$friend-button.click ->
				$friend-button.attr \disabled on
				if check-follow!
					$.ajax "#{CONFIG.web-api-url}/users/unfollow" {
						data: {'user-id': user-id}}
					.done ->
						$friend-button .remove-class \danger
						$friend-button
							..attr \disabled off
							..remove-class \following
							..add-class \not-following
							..find \.text .text 'フォロー'
							..find \i .attr \class 'fa fa-plus'
						$user.attr \data-is-following \false
					.fail ->
						$friend-button.attr \disabled off
				else
					$.ajax "#{CONFIG.web-api-url}/users/follow" {
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

module.exports = UsersList
