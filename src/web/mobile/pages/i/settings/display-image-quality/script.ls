$ = require 'jquery/dist/jquery'
require '../../../../common/scripts/ui.ls'

$ ->
	$form = $ \#form

	$form.submit (event) ->
		event.prevent-default!

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..html '更新中...'

		$.ajax "#{CONFIG.web-api-url}/web/display-image-quality/update" {
			data:
				'quality': $form.find '[name="quality"]' .val!
		}
		.done ->
			alert '更新しました。'
			location.reload!
		.fail (err) ->
			$submit-button
				..attr \disabled off
				..html '更新'
			alert 'ごめんなさい、更新に失敗しました。'
