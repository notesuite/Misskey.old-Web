$ = require 'jquery'
require 'cropper'

Tab = require '../lib/tab.js'
Album = require '../common/album.js'
show-modal-window = require '../common/modal-window.js'
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

	$form.find '.avatar .select-from-album' .click ->
		album.choose-file (files) ->
			file = files.0
			$crop-form = ($form.find '.avatar .crop-form').clone!
			$img = $ "<img src='#{file.url}' alt=''>"
			$crop-form.find \.container .prepend $img
			close = show-modal-window $crop-form, false, ->
				$img.cropper {
					aspect-ratio: 1 / 1
					highlight: no
					view-mode: 1
					preview: $crop-form.find \.preview
				}

			$crop-form.find \.cancel .click ->
				close!

			$crop-form.submit (event) ->
				event.prevent-default!
				$form = $ @
				$submit-button = $form.find '[type=submit]'
					..attr \disabled on
					..attr \value '保存中...'
				crop-data = $img.cropper \getData true
				$.ajax "#{config.web-api-url}/web/sites/desktop/update-avatar" {
					type: \put
					data: {
						'file-id': file.id
						'trim-x': crop-data.x
						'trim-y': crop-data.y
						'trim-w': crop-data.width
						'trim-h': crop-data.height
					}
					xhr-fields: {+with-credentials}}
				.done (data) ->
					close!
					$.ajax "#{config.web-api-url}/web/refresh-session" {
						type: \post
						xhr-fields: {+with-credentials}}

					modal-title = ''
					modal-content = 'アイコンを更新しました。反映まで時間がかかる場合があります。'
					$modal-ok = $ '<button>おｋ</button>'
					close = show-modal-dialog modal-title, modal-content, [$modal-ok]
					$modal-ok.click -> close!
				.fail (data) ->
					$submit-button.attr \disabled off

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
