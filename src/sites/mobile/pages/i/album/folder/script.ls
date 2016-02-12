$ = require 'jquery/dist/jquery'
require '../../../../common/scripts/ui.js'
file-render = require '../file.jade'
folder-render = require '../folder.jade'

$ ->
	$folders = $ \#folders
	$files = $ \#files

	$.ajax "#{CONFIG.web-api-url}/album/folders/list" {
		data:
			'folder-id': FOLDER.id
	}
	.done (folders) ->
		folders.for-each (folder) ->
			$folder = $ folder-render {
				folder
				choose: CHOOSE
				config: CONFIG
			}
			$folders.prepend $folder
		if CHOOSE != \folder
			$.ajax "#{CONFIG.web-api-url}/album/files/list" {
				data:
					'folder-id': FOLDER.id
			}
			.done (files) ->
				$ \#loading .remove!
				files.for-each (file) ->
					$file = $ file-render {
						file
						config: CONFIG
					}
					$files.prepend $file
			.fail ->
		else
			$ \#loading .remove!
	.fail ->

	$rename-folder-button = $ '#album-extended-nav .rename-folder'
	$rename-folder-button.click ->
		name = window.prompt LOCALE.sites.mobile.pages._i._album._folder.rename_dialog, FOLDER.name
		if name? and name != '' and name != FOLDER.name
			$rename-folder-button.attr \disabled on
			$.ajax "#{CONFIG.web-api-url}/album/folders/rename" {
				data:
					'name': name
					'folder-id': FOLDER.id
			} .done (folder) ->
				location.reload!
			.fail (data) ->
				$rename-folder-button.attr \disabled off
				window.alert LOCALE.sites.mobile.pages._i._album._folder.rename_failed

	$create-folder-button = $ '#album-extended-nav .create-folder'
	$create-folder-button.click ->
		name = window.prompt LOCALE.sites.mobile.pages._i._album.create_folder_dialog
		if name? and name != ''
			$create-folder-button.attr \disabled on
			$.ajax "#{CONFIG.web-api-url}/album/folders/create" {
				data:
					'name': name
					'parent-folder-id': FOLDER.id
			} .done (folder) ->
				location.reload!
			.fail (data) ->
				$create-folder-button.attr \disabled off
				window.alert LOCALE.sites.mobile.pages._i._album.create_folder_failed

	if CHOOSE == \folder
		$ \body .css \margin-top ($ \#plz-choose-folder .outer-height!) + 'px'
		$choose-button = $ \#choose-folder-button
		$choose-button.click ->
			window.opener.MISSKEY_CHOOSE_ALBUM_FOLDER_CALLBACK FOLDER
			window.close!
