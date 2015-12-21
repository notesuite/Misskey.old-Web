$ = require 'jquery'
require '../../../../../common/scripts/main.js'

$ ->
	$ \#form .submit (event) ->
		event.prevent-default!
		$form = $ @
		$submit-button = $form.find '[type=submit]'

		$submit-button.attr \disabled yes

		$.ajax "#{config.web-api-url}/talks/group/create" {
			data:
				'name': ($form.find \#name .val!)
		}
		.done (data) ->
		.fail (data) ->
			$submit-button.attr \disabled no
