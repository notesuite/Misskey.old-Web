$ = require 'jquery'
require 'jquery.transit'

CONFIG = require 'config'
require '../../common/scripts/main.ls'
WavesEffect = require '../../common/scripts/lib/waves-effect.js'

$ window .load ->
	WavesEffect.attach-to-class \ripple-effect

$ ->
	init-signin-form!
	init-signup-form!

	$ \#new .click go-signup
	$ '#signup-form .cancel' .click go-signin

function go-signup
	$new = $ \#new
	$title = $ \#title
	$description = $ \#description
	$main = $ \main
	$signin-form = $ \#login-form-container
	$signup-form = $ \#signup-form

	$new.css \pointer-events \none

	$new
		.transition {
			scale: '0.7'
			opacity: 0
			duration: 500ms
		}

	$title
		.transition {
			opacity: 0
			duration: 500ms
		}
		.transition {
			opacity: 1
			duration: 500ms
		}

	$main.css \overflow \hidden
	$main.css \height "#{$main.outer-height!}px"
	$main
		.transition {
			width: '434px'
			duration: 500ms
		}
		.transition {
			height: ($signup-form.outer-height! + 64px + 2px) + 'px'
			'margin-top': (-$description.outer-height!) + 'px'
			duration: 500ms
		}

	$signin-form
		.transition {
			left: '-100%'
			opacity: 0
			duration: 500ms
		}

	$signup-form.css \display \block
	$signup-form
		.transition {
			left: '32px'
			opacity: 1
			duration: 500ms
		}

	set-timeout do
		->
			$title.text LOCALE.sites.desktop.pages._entrance.signup_title
			$description
				.transition {
					opacity: 0
					duration: 500ms
				}
		500ms

	set-timeout do
		->
			$description.css \display \none
			$main.css \height \auto
			$main.css \margin-top \0
			$main.css \overflow \visible
			$new.css \display \none
			$signin-form.css \display \none
			$signup-form.css {
				position: \relative
				top: 0
				left: 0
			}

			$signup-form.find '.user-name > input' .focus!
		1000ms

function go-signin
	$new = $ \#new
	$title = $ \#title
	$description = $ \#description
	$main = $ \main
	$signin-form = $ \#login-form-container
	$signup-form = $ \#signup-form

	$title
		.transition {
			opacity: 0
			duration: 500ms
		}
		.transition {
			opacity: 1
			duration: 500ms
		}

	$description.css \display \block

	$main.css \overflow \hidden
	$main.css \height "#{$main.outer-height!}px"
	$main.css 'margin-top' (-$description.outer-height!) + 'px'
	$main
		.transition {
			width: '380px'
			duration: 500ms
		}
		.transition {
			height: ($signin-form.outer-height! + $new.outer-height! + 64px + 24px + 2px) + 'px'
			'margin-top': '0px'
			duration: 500ms
		}

	$new.css \display \block

	$signup-form.css \position \absolute
	$signup-form.css \top 32px
	$signup-form
		.transition {
			left: '100%'
			opacity: 0
			duration: 500ms
		}

	$signin-form.css \display \block
	$signin-form
		.transition {
			left: '0px'
			opacity: 1
			duration: 500ms
		}

	set-timeout do
		->
			$title.text \Misskey

			$description
				.transition {
					opacity: 1
					duration: 500ms
				}

			$main.css \overflow \visible

			$main
				.transition {
					'margin-top': '0px'
					duration: 500ms
				}

			$new.css \pointer-events \auto
			$new
				.transition {
					scale: '1'
					opacity: 1
					duration: 500ms
				}
		500ms

	set-timeout do
		->
			$main.css \height \auto

			$signup-form.css \display \none
			$signin-form.css {
				position: \relative
				top: 0
				left: 0
			}

			$signin-form.find '.user-name > input' .focus!
		1000ms

function init-card-effect($card)
	force = 10
	perspective = 512

	$card.on 'mousedown' (e) ->
		cx = e.page-x - $card.offset!.left + ($ window).scroll-left!
		cy = e.page-y - $card.offset!.top + ($ window).scroll-top!
		w = $card.outer-width!
		h = $card.outer-height!
		cxp = ((cx / w) * 2) - 1
		cyp = ((cy / h) * 2) - 1
		angle = Math.max(Math.abs(cxp), Math.abs(cyp)) * force
		$card
			.css \transition 'transform 0.05s ease'
			.css \transform "perspective(#{perspective}px) rotate3d(#{-cyp}, #{cxp}, 0, #{angle}deg)"

	$card.on 'mouseleave mouseup' (e) ->
		$card
			.css \transition 'transform 1s ease'
			.css \transform "perspective(#{perspective}px) rotate3d(0, 0, 0, 0deg)"

function init-signin-form
	$form = $ \#login

	init-card-effect $form

	$ \#user-name .change ->
		$.ajax "#{CONFIG.urls.web-api}/users/show", {
			data: {'screen-name': $ \#user-name .val!}
		}
		.done (user) ->
			$ '#login .title p' .text user.name
			$ \#avatar .attr \src user.avatar-thumbnail-url

	$form.submit (event) ->
		event.prevent-default!

		$ \html .add-class \logging

		z = Math.floor(Math.random() * 40) - 20

		$form = $ @
			..css {
				"transform": "perspective(512px) translateY(-100%) scale(0.7) rotateX(-180deg) rotateZ(#{z}deg)",
				"opacity": "0",
				"transition": "all ease-in 0.5s"
			}

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on

		$.ajax CONFIG.urls.signin, {
			data: {
				'screen-name': $form.find '[name="user-name"]' .val!
				'password': $form.find '[name="password"]' .val!
			}
		}
		.done ->
			location.reload!
		.fail ->
			$ \html .remove-class \logging
			$submit-button.attr \disabled off
			$form.css {
				"transform": "perspective(512px) translateY(0) scale(1)",
				"opacity": "1",
				"transition": "all ease 0.7s"
			}

function init-signup-form
	$form = $ \#signup-form

	$form.find '.user-name > input' .keyup ->
		sn = $form.find '.user-name > input' .val!
		if sn != ''
			err = switch
				| not sn.match /^[a-zA-Z0-9\-]+$/ => LOCALE.sites.desktop.pages._entrance._signup.screen_name_error_1
				| sn.length < 3chars              => LOCALE.sites.desktop.pages._entrance._signup.screen_name_error_2
				| sn.length > 20chars             => LOCALE.sites.desktop.pages._entrance._signup.screen_name_error_3
				| _                               => null

			if err
				$form.find '.user-name > .info'
					..children \i .attr \class 'fa fa-exclamation-triangle'
					..children \span .text err
					..attr \data-state \error
				$form.find '.user-name > .profile-page-url-preview' .text ""
			else
				$form.find '.user-name > .info'
					..children \i .attr \class 'fa fa-spinner fa-pulse'
					..children \span .text LOCALE.sites.desktop.pages._entrance._signup.screen_name_info_1
					..attr \data-state \processing
				$form.find '.user-name > .profile-page-url-preview' .text "#{CONFIG.url}/#sn"

				$.ajax "#{CONFIG.urls.web-api}/screenname/available" {
					data: {'screen-name': sn}
				} .done (result) ->
					if result.available
						$form.find '.user-name > .info'
							..children \i .attr \class 'fa fa-check'
							..children \span .text LOCALE.sites.desktop.pages._entrance._signup.screen_name_info_2
							..attr \data-state \ok
					else
						$form.find '.user-name > .info'
							..children \i .attr \class 'fa fa-exclamation-triangle'
							..children \span .text LOCALE.sites.desktop.pages._entrance._signup.screen_name_info_3
							..attr \data-state \error
				.fail (err) ->
					$form.find '.user-name > .info'
						..children \i .attr \class 'fa fa-exclamation-triangle'
						..children \span .text LOCALE.sites.desktop.pages._entrance._signup.screen_name_info_4
						..attr \data-state \error
		else
			$form.find '.user-name > .profile-page-url-preview' .text ""

	$form.find '.password > input' .keyup ->
		password = $form.find '.password > input' .val!
		if password != ''
			err = switch
				| password.length < 8chars => LOCALE.sites.desktop.pages._entrance._signup.password_error_1
				| _                        => null
			if err
				$form.find '.password > .info'
					..children \i .attr \class 'fa fa-exclamation-triangle'
					..children \span .text err
					..attr \data-state \error
			else
				$form.find '.password > .info'
					..children \i .attr \class 'fa fa-check'
					..children \span .text LOCALE.sites.desktop.pages._entrance._signup.password_info_1
					..attr \data-state \ok

	$form.find '.retype-password > input' .keyup ->
		password = $form.find '.password > input' .val!
		retyped-password = $form.find '.retype-password > input' .val!
		if retyped-password != ''
			err = switch
				| retyped-password != password => LOCALE.sites.desktop.pages._entrance._signup.retype_password_error_1
				| _                            => null
			if err
				$form.find '.retype-password > .info'
					..children \i .attr \class 'fa fa-exclamation-triangle'
					..children \span .text err
					..attr \data-state \error
			else
				$form.find '.retype-password > .info'
					..children \i .attr \class 'fa fa-check'
					..children \span .text LOCALE.sites.desktop.pages._entrance._signup.retype_password_info_1
					..attr \data-state \ok

	$form.submit (event) ->
		event.prevent-default!

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on
			..find \span .text LOCALE.sites.desktop.pages._entrance._signup.creating
			..find \i .attr \class 'fa fa-spinner fa-pulse'

		$form.find \input .attr \disabled on

		screen-name = $form.find '[name="user-name"]' .val!
		password = $form.find '[name="password"]' .val!

		$ \html .add-class \logging

		$.ajax "#{CONFIG.urls.web-api}/account/create" {
			data:
				'screen-name': screen-name
				'password': password
				'g-recaptcha-response': grecaptcha.get-response!
		} .done ->
			$submit-button
				.find \span .text LOCALE.sites.desktop.pages._entrance._signup.logging

			location.href = "#{CONFIG.urls.signin}?screen-name=#{screen-name}&password=#{password}"
		.fail ->
			$submit-button
				..attr \disabled off
				.find \span .text LOCALE.sites.desktop.pages._entrance._signup.create
				..find \i .attr \class 'fa fa-check'

			$form.find \input .attr \disabled off

			$ \html .remove-class \logging

window.on-recaptchaed = ->
	$ \.recaptcha .find '> .caption > i' .attr \class 'fa fa-toggle-on'

window.on-recaptcha-expired = ->
	$ \.recaptcha .find '> .caption > i' .attr \class 'fa fa-toggle-off'
