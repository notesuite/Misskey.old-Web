$ = require 'jquery'
require 'cropper'

Tab = require '../lib/tab.js'
Album = require '../common/album.js'
show-modal-dialog = require '../common/modal-dialog.js'

album = new Album

module.exports = ($form) ->
	Tab do
		$form.find '.nav > ul'
		$form.find '.contents'

	$form.find \.profile-form .submit (event) ->
		event.prevent-default!
		$form = $ @
		$submit-button = $form.find '[type=submit]'

		$submit-button.attr \disabled on
		$submit-button.attr \value '保存中...'

		$.ajax "#{config.web-api-url}/account/update" {
			type: \put
			-process-data
			-content-type
			data: new FormData $form.0
			data-type: \json
			xhr-fields: {+with-credentials}}
		.done (data) ->
			$submit-button.attr \value '保存しました'
			$submit-button.attr \disabled off
		.fail (data) ->
			$submit-button.attr \disabled off

	$form.find '.icon .select-from-album' .click ->
		album.choose-file (files) ->
			file = files.0
			$crop-form = ($form.find '.icon .crop-form').clone!
			$img = $ "<img src='#{file.url}' alt=''>"
			$crop-form.prepend $img
			show-modal-dialog $crop-form, ->
				$img.cropper {
					aspect-ratio: 1 / 1
					crop: (data) ->
						$ '#icon-edit-form input[name=trim-x]' .val Math.round data.x
						$ '#icon-edit-form input[name=trim-y]' .val Math.round data.y
						$ '#icon-edit-form input[name=trim-w]' .val Math.round data.width
						$ '#icon-edit-form input[name=trim-h]' .val Math.round data.height
				}

	$form.find '.apps > .app' .each ->
		$app = $ @

		$app.find \.remove .click ->
			$submit-button = $ @

			$submit-button.attr \disabled on
			$submit-button.text 'アンインストール中...'

			fd = new FormData!
			fd.append \app-id $app.attr \data-app-id

			$.ajax "#{config.web-api-url}/account/remove-app" {
				type: \delete
				-process-data
				-content-type
				data: fd
				data-type: \json
				xhr-fields: {+with-credentials}}
			.done (data) ->
				$app.remove!
			.fail (data) ->
				$submit-button.attr \disabled off
				$submit-button.text '再度お試しください'
