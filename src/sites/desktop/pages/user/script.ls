require '../../common/scripts/ui.js'
$ = require 'jquery'

show-modal-window = require '../../common/scripts/modal-window.js'
AlbumWindow = require '../../common/scripts/album-window.js'
avatar-form = require '../../common/scripts/avatar-form.js'
banner-form = require '../../common/scripts/banner-form.js'

album = new AlbumWindow

$ ->
	is-me = LOGIN and ME.id == USER.id

	window.is-following = if LOGIN then USER.is-following else null

	if is-me
		$ \#banner-edit .click ->
			album.choose-file (files) ->
				file = files.0
				banner-form file

		$ \#avatar .click ->
			album.choose-file (files) ->
				file = files.0
				avatar-form file

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
			$.ajax "#{CONFIG.web-api-url}/users/unfollow" {
				data: {'user-id': USER.id}}
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
			$.ajax "#{CONFIG.web-api-url}/users/follow" {
				data: {'user-id': USER.id}}
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
