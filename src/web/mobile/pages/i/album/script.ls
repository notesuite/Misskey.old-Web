$ = require 'jquery'
require '../../../common/scripts/ui.ls'
file-render = require './file.jade'
folder-render = require './folder.jade'

$ ->
	$folders = $ \#folders
	$files = $ \#files

	$.ajax "#{CONFIG.urls.web-api}/album/folders/list"
	.done (folders) ->
		folders.for-each (folder) ->
			$folder = $ folder-render {
				folder
				choose: CHOOSE
				config: CONFIG
			}
			$folders.prepend $folder
		if CHOOSE != \folder
			$.ajax "#{CONFIG.urls.web-api}/album/files/list" {
				data:
					'limit': 21
			}
			.done (files) ->
				if files.length == 0
					$ \#no-files .css \display \block
				if files.length == 21
					$ \#load-more .css \display \block
					files.pop!
				$ \#loading .remove!
				files.for-each (file) ->
					$file = $ file-render {
						file
						config: CONFIG
					}
					$files.append $file
			.fail ->
		else
			$ \#loading .remove!
	.fail ->

	$load-more-button = $ \#load-more
	$load-more-button.click ->
		$load-more-button.attr \disabled on
		$load-more-button.text LOCALE.sites.mobile.pages._i._album.loading
		$.ajax "#{CONFIG.urls.web-api}/album/files/list" {
			data:
				'limit': 21
				'max-cursor': $ '#files > .file:last-child' .attr \data-cursor
		}
		.done (files) ->
			if files.length == 21
				$ \#load-more .css \display \block
				files.pop!
			else
				$ \#load-more .css \display \none
			files.for-each (file) ->
				$file = $ file-render {
					file
					config: CONFIG
				}
				$files.append $file
		.always ->
			$load-more-button.attr \disabled off
			$load-more-button.text LOCALE.sites.mobile.pages._i._album.load_more

	$create-folder-button = $ '#album-extended-nav .create-folder'
	$create-folder-button.click ->
		name = window.prompt LOCALE.sites.mobile.pages._i._album.create_folder_dialog
		if name? and name != ''
			$create-folder-button.attr \disabled on
			$.ajax "#{CONFIG.urls.web-api}/album/folders/create" {
				data:
					'name': name
			} .done (folder) ->
				location.reload!
			.fail (data) ->
				$create-folder-button.attr \disabled off
				window.alert LOCALE.sites.mobile.pages._i._album.create_folder_failed

	if CHOOSE == \folder
		$ \body .css \margin-top ($ \#plz-choose-folder .outer-height!) + 'px'
		$ \body .css \margin-bottom ($ \#choose-folder .outer-height!) + 'px'
		$choose-button = $ \#choose-folder-button
		$choose-button.click ->
			window.opener.MISSKEY_CHOOSE_ALBUM_FOLDER_CALLBACK null
			window.close!
