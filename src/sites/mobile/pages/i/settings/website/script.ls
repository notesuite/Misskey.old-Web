$ = require 'jquery/dist/jquery'
require '../../../../common/scripts/ui.js'

$ ->
	$form = $ \#form

	$form.submit (event) ->
		event.prevent-default!

		$submit-button = $form.find '[type=submit]'
		$submit-button.attr \disabled on
		$submit-button.html '更新中...'

		$.ajax "#{CONFIG.web-api-url}/account/url/update" {
			data: new FormData $form.0}
		.done ->
			alert '更新しました。'
			location.reload!
		.fail (err) ->
			$submit-button.attr \disabled off
			$submit-button.html '更新'
			alert 'ごめんなさい、更新に失敗しました。'
