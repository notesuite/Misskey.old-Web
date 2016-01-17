$ = require 'jquery/dist/jquery'
require '../../../../common/scripts/ui.js'

$ ->
	$form = $ \#form

	$form.find '[name="id"]' .change ->
		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..html '更新中...'

		$.ajax "#{CONFIG.web-api-url}/web/mobile-header-overlay/update" {
			data: {
				'id': $form.find '[name="id"]' .val!
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
