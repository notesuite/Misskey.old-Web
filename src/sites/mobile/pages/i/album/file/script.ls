$ = require 'jquery/dist/jquery'
require '../../../../common/scripts/ui.js'

$ ->
	$rename = $ \#rename
	$rename.click ->
		name = window.prompt LOCALE.sites.mobile.pages._i._album._file.rename_dialog, FILE.name
		if name? and name != '' and name != FILE.name
			$rename.attr \disabled on
			$.ajax "#{CONFIG.web-api-url}/album/files/rename" {
				data:
					'file-id': FILE.id
					'name': name
			} .done (post) ->
				location.reload!
			.fail (data) ->
				$rename.attr \disabled off
				window.alert LOCALE.sites.mobile.pages._i._album._file.rename_failed
