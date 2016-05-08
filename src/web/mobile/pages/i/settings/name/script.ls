$ = require 'jquery'
require '../../../../common/scripts/ui.ls'

$ ->
	$form = $ \#form

	$form.submit (event) ->
		event.prevent-default!

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..html '更新中...'

		$.ajax "#{CONFIG.urls.web-api}/account/name/update" {
			data: {
				'name': $form.find '[name="name"]' .val!
			}
		}
		.done ->
			alert '更新しました。'
			location.reload!
		.fail (err) ->
			$submit-button
				..attr \disabled off
				..html '更新'
			alert 'ごめんなさい、更新に失敗しました。'
