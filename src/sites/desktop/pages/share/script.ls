$ = require 'jquery'
require '../../common/scripts/main.js'

$ ->
	$ \#form .submit (event) ->
		event.prevent-default!
		$form = $ @
		$submit-button = $form.find '[type=submit]'

		$submit-button.attr \disabled yes

		$.ajax "#{CONFIG.web-api-url}/posts/create" {
			data:
				'text': ($form.find \textarea .val!)
		}
		.done (group) ->
			window.close!
		.fail (data) ->
			$submit-button.attr \disabled no
