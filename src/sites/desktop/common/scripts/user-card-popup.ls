$ = require 'jquery/dist/jquery'
require 'jquery.transit'
card-popup-render = require '../views/user-card-popup.jade'
init-user-card = require './init-user-card.js'

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
			$card := $ card-popup-render {
				user
				config: CONFIG
				login: LOGIN
				me: ME
				user-settings: USER_SETTINGS
				locale: LOCALE
			}

			x = $trigger.offset!.left + $trigger.outer-width!
			y = $trigger.offset!.top# + $trigger.outer-height!
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

			init-user-card $card.children \.ui-user-card

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
