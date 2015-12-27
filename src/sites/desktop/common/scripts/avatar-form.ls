$ = require 'jquery'
require 'cropper'

show-modal-window = require './modal-window.js'
show-modal-dialog = require './modal-dialog.js'

module.exports = (file) ->
	$crop-form = $ '<form class="crop-form">
						<p>アイコンに使用する部分を選択してください</p>
						<div class="container">
							<div class="preview"></div>
							<div class="buttons">
								<button type="button" class="no-crop">クロップせずに使用</button>
								<button type="submit" class="ok"><i class="fa fa-check"></i>OK</button>
								<button type="button" class="cancel"><i class="fa fa-ban"></i>キャンセル</button>
							</div>
						</div>
					</form>
				'
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
			$.ajax "#{CONFIG.web-api-url}/web/avatar/update" {
				data:
					'file-id': file.id
			} .done (data) ->
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
		$.ajax "#{CONFIG.web-api-url}/web/avatar/update" {
			data:
				'file-id': file.id
				'trim-x': crop-data.x
				'trim-y': crop-data.y
				'trim-w': crop-data.width
				'trim-h': crop-data.height}
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

		#$ \body .find \img ->
		#	$img = $ @
		#	if ($img.attr \src) ==

		$modal-ok = $ '<button>おｋ</button>'
		dialog-close = show-modal-dialog do
			$ '<p><i class="fa fa-info-circle"></i>アイコンを更新しました</p>'
			'反映まで時間がかかる場合があります。'
			[$modal-ok]
		$modal-ok.click -> dialog-close!
