$ = require 'jquery/dist/jquery'
require '../../../../../common/scripts/ui.js'
choose-color = require '../../../../../common/scripts/choose-color.js'

$ ->
	$ \body .css \margin-bottom ($ \#submit-container .outer-height!) + 'px'

	$new = $ \#new
	$new.click ->
		name = window.prompt LOCALE.sites.mobile.pages._i._album._file._edit_tag.enter_name
		if name? and name != ''
			choose-color (color) ->
				$new.attr \disabled on
				$.ajax "#{CONFIG.web-api-url}/album/tags/create" {
					data:
						'name': name
						'color': color
				} .done ->
					location.reload!
				.fail (data) ->
					$new.attr \disabled off
					window.alert LOCALE.sites.mobile.pages._i._album._file._edit_tag.new_failed

	$ '#tags > .tag' .each ->
		$tag = $ @
		$tag.click ->
			$tag.toggle-class \selected

	$submit = $ \#submit
	$submit.click ->
		tags = []
		$ '#tags > .tag.selected' .each ->
			$tag = $ @
			tags.push $tag.attr \data-id
		if IS_DIALOG
			window.opener.MISSKEY_EDIT_ALBUM_FILE_TAG_CALLBACK tags
			window.close!
