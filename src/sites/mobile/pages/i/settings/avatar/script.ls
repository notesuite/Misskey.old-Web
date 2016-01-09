$ = require 'jquery/dist/jquery'
require 'cropper'
require '../../../../common/scripts/ui.js'
upload-file = require '../../../../../common/upload-file.js'

$ ->
	$form = $ \#form
	$submit-button = $form.find '[type="submit"]'
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
		$img = $ "<img src='#{file.url}' alt=''>"
		$form.append $img
		$img.cropper {
			aspect-ratio: 1 / 1
			highlight: no
			view-mode: 1
			preview: $crop-form.find \.preview
		}
