$ = require 'jquery'
require '../../../../common/scripts/ui.ls'

$ ->
	$form = $ \#form

	$form.find '[name="lang"]' .change ->
		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..html '更新中...'

		$.ajax "#{CONFIG.urls.web-api}/web/ui-language/update" {
			data: {
				'lang': $form.find '[name="lang"]' .val!
			}
		}
		.done ->
			location.reload!
		.fail (err) ->
			$submit-button
				..attr \disabled off
				..html '更新'
			alert 'ごめんなさい、更新に失敗しました。'
