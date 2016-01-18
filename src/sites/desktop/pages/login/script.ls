$ = require 'jquery/dist/jquery'
require 'jquery.transit'
require '../../common/scripts/main.js'

$ ->
	$form = $ '#form'

	$ '#id' .change ->
		$.ajax "#{CONFIG.api-url}/users/show", {
			data: {'screen-name': $ '#id' .val!}
			xhr-fields: {-with-credentials}}
		.done (user) ->
			$ '#avatar' .attr \src user.avatar-url

	$form.submit (event) ->
		event.prevent-default!

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..find \span .text LOCALE.sites.desktop.pages.login.signing_in
			..find \i .attr \class 'fa fa-spinner fa-pulse'

		$ \html .add-class \logging

		$.ajax CONFIG.signin-url, {
			data: {
				'screen-name': $form.find '[name="screen-name"]' .val!
				'password': $form.find '[name="password"]' .val!
			}
		}
		.done ->
			location.reload!
		.fail ->
			$submit-button
				..attr \disabled off
				.find \span .text LOCALE.sites.desktop.pages.login.signin
				..find \i .attr \class 'fa fa-sign-in'

			$ \html .remove-class \logging
