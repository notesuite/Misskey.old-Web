$ = require 'jquery'
require 'jquery.transit'
tooltip = require './tooltiper.ls'

module.exports = ($widget) ->
	user = JSON.parse $widget.attr \data-user

	$friend-button = $widget.find \.friend-button

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
