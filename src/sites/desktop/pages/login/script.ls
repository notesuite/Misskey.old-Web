$ = require 'jquery/dist/jquery'
require 'jquery.transit'
require '../../common/scripts/main.js'

$ ->
	$ '#id' .change ->
		$.ajax "#{CONFIG.api-url}/users/show", {
			data: {'screen-name': $ '#id' .val!}
			xhr-fields: {-with-credentials}}
		.done (user) ->
			$ '#avatar' .attr \src user.avatar-url

	$ '#form' .submit (event) ->
		event.prevent-default!
		$form = $ @
			..css {
				'transform': 'perspective(512px) rotateX(-90deg)'
				'opacity': '0'
				'transition': 'all ease-in 0.5s'
			}

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on

		$.ajax CONFIG.signin-url, {
			data: {
				'screen-name': $form.find '[name="screen-name"]' .val!
				'password': $form.find '[name="password"]' .val!
			}
		}
		.done ->
			location.reload!
		.fail ->
			$submit-button.attr \disabled off
			set-timeout ->
				$form.css {
					'transform': 'perspective(512px) scale(1)'
					'opacity': '1'
					'transition': 'all ease 0.7s'
				}
			, 500ms
