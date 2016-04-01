$ = require 'jquery/dist/jquery'
require '../../../../common/scripts/ui.ls'

$ ->
	$form = $ \#pseudo-push-notification-display-duration-form

	$form.submit (event) ->
		event.prevent-default!

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..html '更新中...'

		$.ajax "#{CONFIG.web-api-url}/web/pseudo-push-notification-display-duration/update" {
			data:
				'duration': $form.find '[name="duration"]' .val!
		}
		.done ->
			alert '更新しました。'
			location.reload!
		.fail (err) ->
			$submit-button
				..attr \disabled off
				..html '更新'
			alert 'ごめんなさい、更新に失敗しました。'
