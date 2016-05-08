$ = require 'jquery'
require 'jquery.transit'
require '../../common/scripts/main.ls'

window.on-recaptchaed = ->
	$ \#recaptcha .find '> .caption > i' .attr \class 'fa fa-toggle-on'

window.on-recaptcha-expired = ->
	$ \#recaptcha .find '> .caption > i' .attr \class 'fa fa-toggle-off'

$ ->
	$form = $ '#form'

	$ '#screen-name > input' .keyup ->
		sn = $ '#screen-name > input' .val!
		if sn != ''
			err = switch
				| not sn.match /^[a-zA-Z0-9\-]+$/ => LOCALE.sites.desktop.pages._signup.screen_name_error_1
				| sn.length < 3chars              => LOCALE.sites.desktop.pages._signup.screen_name_error_2
				| sn.length > 20chars             => LOCALE.sites.desktop.pages._signup.screen_name_error_3
				| _                               => null

			if err
				$ '#screen-name > .info'
					..children \i .attr \class 'fa fa-exclamation-triangle'
					..children \span .text err
					..attr \data-state \error
				$ '#screen-name > .profile-page-url-preview' .text ""
			else
				$ '#screen-name > .info'
					..children \i .attr \class 'fa fa-spinner fa-pulse'
					..children \span .text LOCALE.sites.desktop.pages._signup.screen_name_info_1
					..attr \data-state \processing
				$ '#screen-name > .profile-page-url-preview' .text "#{CONFIG.url}/#sn"

				$.ajax "#{CONFIG.urls.web-api}/screenname/available" {
					data: {'screen-name': sn}
				} .done (result) ->
					if result.available
						$ '#screen-name > .info'
							..children \i .attr \class 'fa fa-check'
							..children \span .text LOCALE.sites.desktop.pages._signup.screen_name_info_2
							..attr \data-state \ok
					else
						$ '#screen-name > .info'
							..children \i .attr \class 'fa fa-exclamation-triangle'
							..children \span .text LOCALE.sites.desktop.pages._signup.screen_name_info_3
							..attr \data-state \error
				.fail (err) ->
					$ '#screen-name > .info'
						..children \i .attr \class 'fa fa-exclamation-triangle'
						..children \span .text LOCALE.sites.desktop.pages._signup.screen_name_info_4
						..attr \data-state \error
		else
			$ '#screen-name > .profile-page-url-preview' .text ""

	$ '#password > input' .keyup ->
		password = $ '#password > input' .val!
		if password != ''
			err = switch
				| password.length < 8chars       => LOCALE.sites.desktop.pages._signup.password_error_1
				| _                              => null
			if err
				$ '#password > .info'
					..children \i .attr \class 'fa fa-exclamation-triangle'
					..children \span .text err
					..attr \data-state \error
			else
				$ '#password > .info'
					..children \i .attr \class 'fa fa-check'
					..children \span .text LOCALE.sites.desktop.pages._signup.password_info_1
					..attr \data-state \ok

	$ '#retype-password > input' .keyup ->
		password = $ '#password > input' .val!
		retyped-password = $ '#retype-password > input' .val!
		if retyped-password != ''
			err = switch
				| retyped-password != password   => LOCALE.sites.desktop.pages._signup.retype_password_error_1
				| _                              => null
			if err
				$ '#retype-password > .info'
					..children \i .attr \class 'fa fa-exclamation-triangle'
					..children \span .text err
					..attr \data-state \error
			else
				$ '#retype-password > .info'
					..children \i .attr \class 'fa fa-check'
					..children \span .text LOCALE.sites.desktop.pages._signup.retype_password_info_1
					..attr \data-state \ok

	$form.submit (event) ->
		event.prevent-default!

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..find \span .text LOCALE.sites.desktop.pages._signup.creating
			..find \i .attr \class 'fa fa-spinner fa-pulse'

		$form.find \input .attr \disabled on

		screen-name = $form.find "[name='#{SCREEN_NAME_INPUT_ID}']" .val!
		password = $form.find "[name='#{PASSWORD_INPUT_ID}']" .val!

		$ \html .add-class \logging

		$.ajax "#{CONFIG.urls.web-api}/account/create" {
			data:
				'screen-name': screen-name
				'password': password
				'g-recaptcha-response': grecaptcha.get-response!
		} .done ->
			$submit-button
				.find \span .text LOCALE.sites.desktop.pages._signup.logging

			location.href = "#{CONFIG.urls.signin}?screen-name=#{screen-name}&password=#{password}"
		.fail ->
			$submit-button
				..attr \disabled off
				.find \span .text LOCALE.sites.desktop.pages._signup.create
				..find \i .attr \class 'fa fa-check'

			$form.find \input .attr \disabled off

			$ \html .remove-class \logging
