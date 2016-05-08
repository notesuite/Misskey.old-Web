$ = require 'jquery'
require 'jquery.transit'

CONFIG = require 'config'
require '../../common/scripts/main.ls'

$ ->
	$form = $ \#login

	$form.on 'mousedown' (e) ->
		force = 10
		cx = e.page-x - $form.position!.left
		cy = e.page-y - $form.position!.top
		w = $form.outer-width!
		h = $form.outer-height!
		cxp = ((cx / w) * 2) - 1
		cyp = ((cy / h) * 2) - 1
		angle = Math.max(Math.abs(cxp), Math.abs(cyp)) * force
		$form
			.css \transition 'transform 0.05s ease'
			.css \transform "perspective(256px) rotate3d(#{-cyp}, #{cxp}, 0, #{angle}deg)"

	$form.on 'mouseleave mouseup' (e) ->
		$form
			.css \transition 'transform 1s ease'
			.css \transform 'perspective(256px) rotate3d(0, 0, 0, 0deg)'

	$form.submit (event) ->
		event.prevent-default!
		$form = $ @
			..css {
				'transform': 'perspective(512px) rotateX(-90deg)'
				'opacity': '0'
				'transition': 'all ease-in 0.5s'
			}

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on

		$.ajax CONFIG.urls.signin, {
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
