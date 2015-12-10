require '../../common/scripts/ui.js'
$ = require 'jquery'

AlbumWindow = require '../../common/scripts/album-window.js'
avatar-form = require '../../common/scripts/avatar-form.js'
banner-form = require '../../common/scripts/banner-form.js'

album = new AlbumWindow

$ ->
	if is-me
		$ \#banner-edit .click ->
			album.choose-file (files) ->
				file = files.0
				banner-form file

		$ \#avatar .click ->
			album.choose-file (files) ->
				file = files.0
				avatar-form file

	/*
	$ \#screen-name .click ->
		element= document.get-element-by-id \screen-name
		rng = document.create-range!
		rng.select-node-contents element
		window.get-selection!.add-range rng
	*/

	$ '#friend-button' .hover do
		->
			if window.is-following
				$ '#friend-button' .add-class \danger
				$ '#friend-button' .text 'フォロー解除'
		->
			if window.is-following
				$ '#friend-button' .remove-class \danger
				$ '#friend-button' .text 'フォロー中'

	$ '#friend-button' .click ->
		$button = $ @
			..attr \disabled on
		if window.is-following
			$.ajax "#{config.web-api-url}/users/unfollow" {
				data: {'user-id': window.user-id}
				data-type: \json}
			.done ->
				$button .remove-class \danger
				$button
					..attr \disabled off
					..remove-class \following
					..add-class \notFollowing
					..text 'フォロー'
				window.is-following = false
			.fail ->
				$button.attr \disabled off
		else
			$.ajax "#{config.web-api-url}/users/follow" {
				data: {'user-id': window.user-id}
				data-type: \json}
			.done ->
				$button
					..attr \disabled off
					..remove-class \notFollowing
					..add-class \following
					..text 'フォロー中'
				window.is-following = true
			.fail ->
				$button.attr \disabled off

	$ window .scroll ->
		top = $ @ .scroll-top!
		height = parse-int($ \#header-data .css \height)
		pos = 50 - ((top / height) * 50)
		$ \#header-data .css \background-position "center #{pos}%"
