$ = require 'jquery'
require '../../common/scripts/main.ls'

$ ->
	$ \#form .submit (event) ->
		event.prevent-default!
		$form = $ @
		$submit-button = $form.find '[type=submit]'

		$submit-button.attr \disabled yes

		$.ajax "#{CONFIG.urls.api}/posts/create" {
			data:
				'text': ($form.find \textarea .val!)
		}
		.done (group) ->
			alert '投稿しました。'
			window.close!
		.fail (data) ->
			$submit-button.attr \disabled no
