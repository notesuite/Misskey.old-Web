$ = require 'jquery/dist/jquery'
require 'cropper'
require '../../../../common/scripts/ui.js'
upload-file = require '../../../../../common/upload-file.js'

$ ->
	$form = $ \#form
	$submit-button = $form.find \.submit
	$progress = $form.find \progress
		..css \display \none

	$file = $form.find '[type="file"]'

	$file.change ->
		file = $file[0].files.item 0
		$progress.css \display \block
		upload-file do
			file
			$progress
			null
			crop
			->
				alert '画像のアップロードに失敗しました。'

	function crop file
		$crop-form = $ '<form class="crop-form">
				<p>' + LOCALE.sites.mobile.pages._i._settings._avatar.crop_form.title + '</p>
				<div class="container">
				</div>
				<div class="buttons">
					<button type="submit" class="ok"><i class="fa fa-check"></i>' + LOCALE.sites.mobile.pages._i._settings._avatar.crop_form.ok + '</button>
					<button type="button" class="cancel"><i class="fa fa-ban"></i>' + LOCALE.sites.mobile.pages._i._settings._avatar.crop_form.cancel + '</button>
				</div>
			</form>
		'
		$img = $ "<img src='#{file.url}' alt=''>"
		$crop-form.find \.container .prepend $img
		$ \body .append $crop-form
		$img.cropper {
			aspect-ratio: 1 / 1
			highlight: no
			view-mode: 1
		}

		$crop-form.find \.cancel .click ->
			$crop-form.remove!

		$crop-form.submit (event) ->
			event.prevent-default!
			$form = $ @
			$submit-button = $form.find '[type=submit]'
				..attr \disabled on
				..html '保存中...'
			crop-data = $img.cropper \getData true
			$.ajax "#{CONFIG.web-api-url}/web/avatar/update" {
				data:
					'file-id': file.id
					'trim-x': crop-data.x
					'trim-y': crop-data.y
					'trim-w': crop-data.width
					'trim-h': crop-data.height}
			.done (data) ->
				alert 'アイコンを更新しました。'
				location.reload!
			.fail (data) ->
				$submit-button
					..attr \disabled off
					..html '<i class="fa fa-check"></i>OK'
				alert 'ごめんなさい、アイコンの更新に失敗しました。'
