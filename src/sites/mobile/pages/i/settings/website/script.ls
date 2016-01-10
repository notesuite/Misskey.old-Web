$ = require 'jquery/dist/jquery'
require '../../../../common/scripts/ui.js'

$ ->
	$form = $ \#form

	$form.submit (event) ->
		event.prevent-default!
		$form = $ @
		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..html '更新中...'
		$.ajax "#{CONFIG.web-api-url}/account/url/update" {
			data: new FormData $form.0}
		.done (data) ->
			alert '更新しました。'
			location.reload!
		.fail (data) ->
			$submit-button
				..attr \disabled off
				..html '更新'
			alert 'ごめんなさい、更新に失敗しました。'
