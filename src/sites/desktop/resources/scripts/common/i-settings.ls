$ = require 'jquery'

Tab = require '../lib/tab.js'

module.exports = ($settings-form) ->
	Tab do
		$settings-form.find '.nav > ul'
		$settings-form.find '.contents'

	$settings-form.find \.profile-form .submit (event) ->
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

	$settings-form.find '.apps > .app' .each ->
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
