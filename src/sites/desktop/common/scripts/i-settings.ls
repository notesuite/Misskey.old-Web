$ = require 'jquery'
require 'cropper'

Tab = require './lib/tab.js'
Album = require './album.js'
show-modal-window = require './modal-window.js'
show-modal-dialog = require './modal-dialog.js'

album = new Album

module.exports = ($form) ->
	Tab do
		$form.find '.nav > ul'
		$form.find '.contents'

	$form.find '.profile.submit-button' .click ->
		$submit-button = $ @

		$submit-button.attr \disabled on
		$submit-button.text 'Updating...'

		(data) <- $.ajax "#{config.web-api-url}/account/name/update" {
			data:
				'name': $form.find '.profile.name' .val!
			xhr-fields: {+with-credentials}}
		.done!

		(data) <- $.ajax "#{config.web-api-url}/account/comment/update" {
			data:
				'comment': $form.find '.profile.comment' .val!
			xhr-fields: {+with-credentials}}
		.done!

		(data) <- $.ajax "#{config.web-api-url}/account/url/update" {
			data:
				'url': $form.find '.profile.url' .val!
			xhr-fields: {+with-credentials}}
		.done!

		(data) <- $.ajax "#{config.web-api-url}/account/location/update" {
			data:
				'location': $form.find '.profile.location' .val!
			xhr-fields: {+with-credentials}}
		.done!

		$submit-button.text 'Update'
		$submit-button.attr \disabled off

		$.ajax "#{config.web-api-url}/web/refresh-session" {
			xhr-fields: {+with-credentials}}

		$modal-ok = $ '<button>おｋ</button>'
		dialog-close = show-modal-dialog do
			$ '<p><i class="fa fa-info-circle"></i>プロフィールを更新しました</p>'
			'反映まで時間がかかる場合があります。'
			[$modal-ok]
		$modal-ok.click -> dialog-close!

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

			$crop-form.find \.no-crop .click ->
				if file.properties.width != file.properties.height
					$modal-ok = $ '<button>わかりました</button>'
					dialog-close = show-modal-dialog do
						$ '<p><i class="fa fa-exclamation-triangle"></i>この画像はそのまま使用できません</p>'
						'この画像は正方形ではないので、アイコンに使用するためにはクロップする必要があります。'
						[$modal-ok]
					$modal-ok.click -> dialog-close!
				else
					$.ajax "#{config.web-api-url}/web/sites/desktop/avatar/update" {
						data:
							'file-id': file.id
						xhr-fields: {+with-credentials}}
					.done (data) ->
						ok!
					.fail ->
						$modal-ok = $ '<button>そうですか</button>'
						dialog-close = show-modal-dialog do
							$ '<p><i class="fa fa-exclamation-triangle"></i>更新に失敗しました</p>'
							'申し訳ありません。何か問題が発生したようです。'
							[$modal-ok]
						$modal-ok.click -> dialog-close!

			$crop-form.submit (event) ->
				event.prevent-default!
				$form = $ @
				$submit-button = $form.find '[type=submit]'
					..attr \disabled on
					..attr \value '保存中...'
				crop-data = $img.cropper \getData true
				$.ajax "#{config.web-api-url}/web/sites/desktop/avatar/update" {
					data:
						'file-id': file.id
						'trim-x': crop-data.x
						'trim-y': crop-data.y
						'trim-w': crop-data.width
						'trim-h': crop-data.height
					xhr-fields: {+with-credentials}}
				.done (data) ->
					ok!
				.fail (data) ->
					$submit-button.attr \disabled off
					$modal-ok = $ '<button>そうですか</button>'
					dialog-close = show-modal-dialog do
						$ '<p><i class="fa fa-exclamation-triangle"></i>更新に失敗しました</p>'
						'申し訳ありません。何か問題が発生したようです。'
						[$modal-ok]
					$modal-ok.click -> dialog-close!

			function ok
				close!

				$.ajax "#{config.web-api-url}/web/refresh-session" {
					xhr-fields: {+with-credentials}}

				#$ \body .find \img ->
				#	$img = $ @
				#	if ($img.attr \src) ==

				$modal-ok = $ '<button>おｋ</button>'
				dialog-close = show-modal-dialog do
					$ '<p><i class="fa fa-info-circle"></i>アイコンを更新しました</p>'
					'反映まで時間がかかる場合があります。'
					[$modal-ok]
				$modal-ok.click -> dialog-close!

	$form.find '.apps > .app' .each ->
		$app = $ @

		$app.find \.remove .click ->
			$submit-button = $ @

			$submit-button.attr \disabled on
			$submit-button.text 'アンインストール中...'

			fd = new FormData!
			fd.append \app-id $app.attr \data-app-id

			$.ajax "#{config.web-api-url}/account/remove-app" {
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
