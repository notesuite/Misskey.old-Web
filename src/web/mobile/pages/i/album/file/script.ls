$ = require 'jquery/dist/jquery'
require '../../../../common/scripts/ui.ls'

$ ->
	$tag-edit = $ \#tag-edit
	$tag-edit.click ->
		window.MISSKEY_EDIT_ALBUM_FILE_TAG_CALLBACK = (tags) ->
			$tag-edit.attr \disabled on
			$.ajax "#{CONFIG.web-api-url}/album/files/update-tag" {
				data:
					'file-id': FILE.id
					'tags': tags.join \,
			} .done ->
				location.reload!
			.fail (data) ->
				$tag-edit.attr \disabled off
		window.open "#{CONFIG.url}/i/album/file/#{FILE.id}/edit-tag?dialog"

	$rename = $ \#rename
	$rename.click ->
		name = window.prompt LOCALE.sites.mobile.pages._i._album._file.rename_dialog, FILE.name
		if name? and name != '' and name != FILE.name
			$rename.attr \disabled on
			$.ajax "#{CONFIG.web-api-url}/album/files/rename" {
				data:
					'file-id': FILE.id
					'name': name
			} .done ->
				location.reload!
			.fail (data) ->
				$rename.attr \disabled off
				window.alert LOCALE.sites.mobile.pages._i._album._file.rename_failed

	$delete = $ \#delete
	$delete.click ->
		if window.confirm LOCALE.sites.mobile.pages._i._album._file.delete_dialog
			$delete.attr \disabled on
			$.ajax "#{CONFIG.web-api-url}/album/files/delete" {
				data:
					'file-id': FILE.id
			} .done ->
				location.href = CONFIG.url + '/i/album'
			.fail (data) ->
				$delete.attr \disabled off
				window.alert LOCALE.sites.mobile.pages._i._album._file.delete_failed

	$move = $ \#move
	$move.click ->
		window.MISSKEY_CHOOSE_ALBUM_FOLDER_CALLBACK = (folder) ->
			$move.attr \disabled on
			$.ajax "#{CONFIG.web-api-url}/album/files/move" {
				data:
					'file-id': FILE.id
					'folder-id': if folder? then folder.id else \null
			} .done ->
				location.reload!
			.fail (data) ->
				$move.attr \disabled off
		window.open CONFIG.url + '/i/album?choose=folder'
