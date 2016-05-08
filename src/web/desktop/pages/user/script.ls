require '../../common/scripts/ui.ls'
$ = require 'jquery'

show-modal-window = require '../../common/scripts/modal-window.ls'
AlbumDialog = require '../../common/scripts/album-dialog.ls'
avatar-form = require '../../common/scripts/avatar-form.ls'
banner-form = require '../../common/scripts/banner-form.ls'

$ ->
	is-me = LOGIN and ME.id == USER.id

	window.is-following = if LOGIN then USER.is-following else null

	if is-me
		$ \#banner-edit .click ->
			album = new AlbumDialog
			album.choose-file (files) ->
				file = files.0
				banner-form file

		$ \#avatar .click ->
			album = new AlbumDialog
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
			$.ajax "#{CONFIG.urls.web-api}/users/unfollow" {
				data: {'user-id': USER.id}}
			.done ->
				$button .remove-class \danger
				$button
					..attr \disabled off
					..remove-class \following
					..add-class \not-following
					..find \.text .text 'フォロー'
					..find \i .attr \class 'fa fa-plus'
				window.is-following = false
			.fail ->
				$button.attr \disabled off
		else
			$.ajax "#{CONFIG.urls.web-api}/users/follow" {
				data: {'user-id': USER.id}}
			.done ->
				$button
					..attr \disabled off
					..remove-class \not-following
					..add-class \following
					..find \.text .text 'フォロー中'
					..find \i .attr \class 'fa fa-minus-circle'
				window.is-following = true
			.fail ->
				$button.attr \disabled off

	$ window .scroll ->
		top = $ @ .scroll-top!
		height = parse-int($ \#header-data .css \height)
		pos = 50 - ((top / height) * 50)
		$ \#header-data .css \background-position "center #{pos}%"
