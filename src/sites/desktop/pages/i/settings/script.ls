require '../../../common/scripts/ui.js'

$ = require 'jquery'

Tab = require '../../../common/scripts/lib/tab.js'
AlbumWindow = require '../../../common/scripts/album-window.js'
show-modal-window = require '../../../common/scripts/modal-window.js'
show-modal-dialog = require '../../../common/scripts/modal-dialog.js'
avatar-form = require '../../../common/scripts/avatar-form.js'

album = new AlbumWindow

function chain-case-to-camel-case p
	p.replace /-./g (s) -> s.char-at 1 .to-upper-case!

$ ->
	$form = $ \main

	Tab do
		$form.find '.nav > ul'
		$form.find '.contents'

	$form.find '.profile.submit-button' .click ->
		$submit-button = $ @

		$submit-button.attr \disabled on
		$submit-button.text 'Updating...'

		(data) <- $.ajax "#{CONFIG.web-api-url}/account/name/update" {
			data:
				'name': $form.find '.profile.name' .val!}
		.done!

		(data) <- $.ajax "#{CONFIG.web-api-url}/account/comment/update" {
			data:
				'comment': $form.find '.profile.comment' .val!}
		.done!

		(data) <- $.ajax "#{CONFIG.web-api-url}/account/url/update" {
			data:
				'url': $form.find '.profile.url' .val!}
		.done!

		(data) <- $.ajax "#{CONFIG.web-api-url}/account/location/update" {
			data:
				'location': $form.find '.profile.location' .val!}
		.done!

		$submit-button.text 'Update'
		$submit-button.attr \disabled off

		$modal-ok = $ '<button>おｋ</button>'
		dialog-close = show-modal-dialog do
			$ '<p><i class="fa fa-info-circle"></i>プロフィールを更新しました</p>'
			'反映まで時間がかかる場合があります。'
			[$modal-ok]
		$modal-ok.click -> dialog-close!

	$form.find '.avatar .select-from-album' .click ->
		album.choose-file (files) ->
			file = files.0
			avatar-form file

	$form.find '.apps > .app' .each ->
		$app = $ @

		$app.find \.remove .click ->
			$submit-button = $ @

			$submit-button.attr \disabled on
			$submit-button.text 'アンインストール中...'

			fd = new FormData!
			fd.append \app-id $app.attr \data-app-id

			$.ajax "#{CONFIG.web-api-url}/account/remove-app" {
				data: fd
				data-type: \json}
			.done (data) ->
				$app.remove!
			.fail (data) ->
				$submit-button.attr \disabled off
				$submit-button.text '再度お試しください'

	init-checkbox-controll $form.find '.web [name="enable-url-preview-in-post"]'
	init-checkbox-controll $form.find '.web [name="enable-notification-sound-when-receiving-new-post"]'
	init-checkbox-controll $form.find '.web [name="enable-automatic-reading-of-timeline"]'
	init-checkbox-controll $form.find '.web [name="enable-sushi"]'

function init-checkbox-controll $checkbox
	$checkbox.change ->
		$checkbox
			..attr \disabled on
			..add-class \updating

		data = {
			key: chain-case-to-camel-case $checkbox.attr \name
			value: $checkbox.is \:checked
		}

		$.ajax "#{CONFIG.web-api-url}/web/user-settings/update" {data}
		.always ->
			$checkbox
				..attr \disabled off
				..remove-class \updating
