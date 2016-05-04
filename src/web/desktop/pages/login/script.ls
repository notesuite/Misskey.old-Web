$ = require 'jquery'
require 'jquery.transit'
require '../../common/scripts/main.ls'

$ ->
	$form = $ '#form'

	$ '#id' .change ->
		$.ajax "#{CONFIG.web-api-url}/users/show", {
			data: {'screen-name': $ '#id' .val!}
		}
		.done (user) ->
			$ '#avatar' .attr \src user.avatar-thumbnail-url

	$form.submit (event) ->
		event.prevent-default!

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..find \span .text LOCALE.sites.desktop.pages._login.signing_in
			..find \i .attr \class 'fa fa-spinner fa-pulse'

		$form.find \input .attr \disabled on

		$ \html .add-class \logging

		$.ajax CONFIG.signin-url, {
			data:
				'screen-name': $form.find '[name="screen-name"]' .val!
				'password': $form.find '[name="password"]' .val!
		}
		.done ->
			location.reload!
		.fail (err) ->
			console.error err

			$submit-button
				..attr \disabled off
				.find \span .text LOCALE.sites.desktop.pages._login.signin
				..find \i .attr \class 'fa fa-sign-in'

			$form.find \input .attr \disabled off

			$ \html .remove-class \logging

			text = switch (err.response-text)
				| \user-not-found => LOCALE.sites.desktop.pages._login.failed_1
				| \failed => LOCALE.sites.desktop.pages._login.failed_2

			$form.find '.info'
				..children \i .attr \class 'fa fa-exclamation-triangle'
				..children \span .text text
				..attr \data-state \error
