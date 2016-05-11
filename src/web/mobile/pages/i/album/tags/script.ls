$ = require 'jquery'
require '../../../../common/scripts/ui.ls'
choose-color = require '../../../../common/scripts/choose-color.ls'

$ ->
	$add = $ \#add
	$add.click ->
		name = window.prompt LOCALE.sites.mobile.pages._i._album._tags.enter_name
		if name? and name != ''
			choose-color (color) ->
				$add.attr \disabled on
				$.ajax "#{CONFIG.urls.api}/album/tags/create" {
					data:
						'name': name
						'color': color
				} .done ->
					location.reload!
				.fail (data) ->
					$add.attr \disabled off
					window.alert LOCALE.sites.mobile.pages._i._album._tags.add_failed

	$ '#tags > .tag' .each ->
		$tag = $ @
		name = $tag.attr \data-name
		id = $tag.attr \data-id
		$rename = $tag.find \.rename
		$recolor = $tag.find \.recolor
		$delete = $tag.find \.delete

		$rename.click ->
			new-name = window.prompt LOCALE.sites.mobile.pages._i._album._tags.rename_dialog.replace '{name}' name
			if new-name? and new-name != ''
				$rename.attr \disabled on
				$.ajax "#{CONFIG.urls.api}/album/tags/rename" {
					data:
						'tag-id': id
						'name': new-name
				} .done ->
					location.reload!
				.fail (data) ->
					$rename.attr \disabled off

		$recolor.click ->
			choose-color (color) ->
				$recolor.attr \disabled on
				$.ajax "#{CONFIG.urls.api}/album/tags/recolor" {
					data:
						'tag-id': id
						'color': color
				} .done ->
					location.reload!
				.fail (data) ->
					$recolor.attr \disabled off

		$delete.click ->
			if window.confirm LOCALE.sites.mobile.pages._i._album._tags.delete_dialog.replace '{name}' name
				$delete.attr \disabled on
				$.ajax "#{CONFIG.urls.api}/album/tags/delete" {
					data:
						'tag-id': id
				} .done ->
					location.reload!
				.fail (data) ->
					$delete.attr \disabled off
