$ = require 'jquery/dist/jquery'
require 'jquery.transit'
card-render = require '../views/user-card.jade'

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
			$card.append-to $ \body
				.transition {
					scale: 0.9
					opacity: 0
				} 0ms
				.transition {
					scale: 1
					opacity: 1
				} 200ms \ease

	function close
		if $card?
			$card
				.transition {
					scale: 0.9
					opacity: 0
				} 200ms \ease ->
					$card.remove!
					$card := null
