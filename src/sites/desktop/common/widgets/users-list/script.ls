$ = require 'jquery'

class UsersList
	($list) ->
		$list.find '.user' .each ->
			$user = $ @
			user-id = $user.attr \data-id

			function check-follow
				($user.attr \data-is-following) == \true

			$friend-status = $user.find '.friend-form .friend-status'
			$tooltip = $ '<p class="ui-tooltip">' .text $friend-status.attr \data-tooltip
			$friend-status .hover do
				->
					$tooltip.css \bottom $friend-status.outer-height! + 4px
					$friend-status.append $tooltip
					$friend-status.find \.ui-tooltip .css \left ($friend-status.outer-width! / 2) - ($tooltip.outer-width! / 2)
				->
					$friend-status.find \.ui-tooltip .remove!

			$friend-button = $user.find '.friend-form .friend-button'
			$friend-button .hover do
				->
					if check-follow!
						$friend-button .add-class \danger
						$friend-button .text 'Unfollow'
				->
					if check-follow!
						$friend-button .remove-class \danger
						$friend-button .text 'Following'

			$friend-button.click ->
				$friend-button.attr \disabled on
				if check-follow!
					$.ajax "#{CONFIG.web-api-url}/users/unfollow" {
						data: {'user-id': user-id}}
					.done ->
						$friend-button.remove-class \danger
						$friend-button
							..attr \title 'フォローする'
							..remove-class \following
							..add-class \not-following
							..text 'Follow'
						$user.attr \data-is-following \false
					.fail ->
					.always ->
						$friend-button.attr \disabled off
				else
					$.ajax "#{CONFIG.web-api-url}/users/follow" {
						data: {'user-id': user-id}}
					.done ->
						$friend-button
							..attr \title 'フォローを解除する'
							..remove-class \not-following
							..add-class \following
							..text 'Following'
						$user.attr \data-is-following \true
					.fail ->
					.always ->
						$friend-button.attr \disabled off

module.exports = UsersList
