$ = require 'jquery'
require 'jquery.transit'

CONFIG = require 'config'
require '../../common/scripts/main.ls'

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

$ ->
	$form = $ \#login

	init-card-effect $form

	$form.submit (event) ->
		event.prevent-default!
		$form = $ @
			..css {
				"transform": "perspective(512px) translateY(-100%) scale(0.7) rotateX(-180deg) rotateZ(" + (Math.floor(Math.random() * 40) - 20) + "deg)",
				"opacity": "0",
				"transition": "all ease-in 0.5s"
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
			$form.css {
				"transform": "perspective(512px) translateY(0) scale(1)",
				"opacity": "1",
				"transition": "all ease 0.7s"
			}
