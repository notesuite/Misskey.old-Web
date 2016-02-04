$ = require 'jquery/dist/jquery'
require 'jquery.transit'
card-render = require '../views/user-card.jade'
tooltip = require './tooltiper.js'

module.exports = ($trigger) ->
	$card = null

	sn = $trigger.attr \data-user-card

	$trigger.hover do
		->
			clear-timeout $trigger.user-profile-show-timer
			clear-timeout $trigger.user-profile-hide-timer
			if not $card?
				$trigger.user-profile-show-timer = set-timeout ->
					show!
				, 500ms
		->
			clear-timeout $trigger.user-profile-show-timer
			clear-timeout $trigger.user-profile-hide-timer
			$trigger.user-profile-hide-timer = set-timeout ->
				close!
			, 500ms

	function show
		$.ajax "#{CONFIG.web-api-url}/users/show" {
			data:
				'screen-name': sn
		}
		.done (user) ->
			$card := $ card-render {
				user
				config: CONFIG
				login: LOGIN
				me: ME
				user-settings: USER_SETTINGS
				locale: LOCALE
			}

			x = $trigger.offset!.left + $trigger.outer-width!
			y = $trigger.offset!.top + $trigger.outer-height!
			$card.css {
				'top': "#{y}px"
				'left': "#{x}px"
			}

			$card.hover do
				->
					clear-timeout $trigger.user-profile-hide-timer
				->
					clear-timeout $trigger.user-profile-show-timer
					$trigger.user-profile-hide-timer = set-timeout ->
						close!
					, 500ms

			$friend-button = $card.find \.friend-button

			tooltip $friend-button

			$friend-button.click ->
				$friend-button.attr \disabled on
				if user.is-following
					$.ajax "#{CONFIG.web-api-url}/users/unfollow" {
						data: {'user-id': user.id}}
					.done ->
						$friend-button.remove-class \danger
						$friend-button
							..attr \data-tooltip LOCALE.sites.desktop.common.user_card.follow
							..remove-class \following
							..add-class \not-following
						user.is-following = false
					.fail ->
					.always ->
						$friend-button.attr \disabled off
				else
					$.ajax "#{CONFIG.web-api-url}/users/follow" {
						data: {'user-id': user.id}}
					.done ->
						$friend-button
							..attr \data-tooltip LOCALE.sites.desktop.common.user_card.unfollow
							..remove-class \not-following
							..add-class \following
						user.is-following = true
					.fail ->
					.always ->
						$friend-button.attr \disabled off

			$card.append-to $ \body
				.transition {
					scale: 0.9
					opacity: 0
				} 0ms
				.transition {
					scale: 1
					opacity: 1
				} 200ms \ease

			$ document .on \click on-click

	function close
		$ document .off \click on-click
		if $card?
			$card
				.transition {
					scale: 0.9
					opacity: 0
				} 200ms \ease ->
					$card.remove!
					$card := null

	function on-click(e)
		if $card[0] !== e.target and !$.contains $card[0], e.target
			close!
