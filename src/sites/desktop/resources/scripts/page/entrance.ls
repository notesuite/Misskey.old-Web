$ = require 'jquery'
require 'jquery.transit'

$ ->
	$ '#login-form' .submit (event) ->
		event.prevent-default!
		$form = $ @
			..css {
				'transform': 'perspective(512px) rotateX(-90deg)'
				'opacity': '0'
				'transition': 'all ease-in 0.5s'
			}

		$submit-button = $form.find '[type=submit]'
			..attr \disabled on

		$.ajax '/login' {
			type: \post
			data: $form.serialize!}
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

	$ '#new' .click show-register-form
	init-register-form!

function init-register-form
	init-user-name-section!
	init-password-section!
	init-password-retype-section!

	$ '#register-form form' .submit (event) ->
		event.prevent-default!
		$form = $ @

		$.ajax "#{config.web-api-url}/account/create" {
			type: \post
			data: $form.serialize!
			data-type: \json
			xhr-fields: {+with-credentials}}
		.done ->
			location.href = "#{config.url}/welcome"
		.fail ->

	$ '#register-cancel' .click (event) ->
		hide-register-form!

	function init-user-name-section
		$column = $ '#register-form .user-name'
		$input = $ '#register-form input[name="screen-name"]'

		$input.on \keypress (event) ->
			if event.which == 13
				$ '#register-form input[name="password"]' .focus!

		$input.keyup ->
			hide-message!
			sn = $input .val!

			$ '.profile-page-url-preview' .text "https://misskey.xyz/#sn"

			if sn != ''
				err = switch
					| not sn.match /^[a-zA-Z0-9_]+$/ => '半角英数記号(_)のみでお願いしますっ'
					| sn.length < 4chars             => '4文字以上でお願いしますっ'
					| sn.match /^[0-9]+$/            => 'すべてを数字にすることはできませんっ'
					| sn.length > 20chars            => '20文字以内でお願いします'
					| _                              => null

				if err
					show-message err, no
				else
					show-message '確認中...' null
					$.ajax "#{config.web-api-url}/screenname-available" {
						type: \get
						data: {'screen-name': sn}
						data-type: \json
						xhr-fields: {+with-credentials}}
					.done (result) ->
						if result.available
							show-message 'このIDは使用できますっ！' yes
						else
							show-message 'このIDは既に使用されていますっ' no
					.fail (err) ->
						show-message '確認に失敗しました;;' null

		function show-message(message, success)
			hide-message!
			klass = if success == null
				then ''
				else
					if success then \done else \fail
			$message = $ "<p id=\"user-name-available\" class=\"message #{klass}\">#{message}</p>"
			$message.append-to $column

		function hide-message
			$ '#user-name-available' .remove!

	function init-password-section
		$input = $ '#register-form input[name="password"]'
		$column = $ '#register-form .password'

		$input .on \keypress (event) ->
			if event.which == 13
				$ '#register-form input[name="retype-password"]' .focus!

		$input .keyup ->
			right = no
			hide-message!
			password = $input .val!
			if password.length > 0
				err = switch
					| password.length < 8chars => '8文字以上でお願いします'
					| _ => null
				if err
					show-message err, no
				else
					show-message 'Nice!' yes
					right = yes
			else
				false

		function show-message(message, success)
			hide-message!
			klass = if success == null
				then ''
				else
					if success then \done else \fail
			$message = $ "<p id=\"passwordAvailable\" class=\"message #{klass}\">#{message}</p>"
			$message.append-to '#register-form .password'

		function hide-message
			$ '#passwordAvailable' .remove!

	function init-password-retype-section
		$input = $ '#register-form input[name="retype-password"]'
		$column = $ '#register-form .password-retype'

		$input .keyup ->
			hide-message!
			password = $ password-input-query .val!
			password-retype = $input .val!
			if password-retype.length > 0chars
				if password-retype != password
					show-message '一致していませんっ！' no
					false
				else
					show-message 'Okay!' yes
			else
				false

		function show-message(message, success)
			hide-message!
			klass = if success == null
				then ''
				else
					if success then \done else \fail
			$message = $ "<p id=\"passwordRetypeAvailable\" class=\"message #{klass}\">#{message}</p>"
			$message.append-to '#register-form .password-retype'

		function hide-message
			$ '#passwordRetypeAvailable' .remove!

function show-register-form
	$ \#register-form-background .css \display \block
	$ \#register-form-background .animate {
		opacity: 1
	} 300ms \linear
	$ \#register-form .stop!
	$ \#register-form .css \display \block
	$ \#register-form .css \transform 'scale(1.2)'
	$ \#register-form .transition {
		opacity: \1
		scale: \1
	} 1000ms 'cubic-bezier(0, 1, 0, 1)'
	$ '#register-form .user-name .user-name-input' .focus!

function hide-register-form
	$ \#register-form-background .animate {
		opacity: 0
	} 500ms \linear ->
		$ \#register-form-background .css \display \none
	$ \#misskey-post-form .stop!
	$ \#register-form .transition {
		opacity: \0
		scale: \0.8
	} 1000ms 'cubic-bezier(0, 1, 0, 1)' ->
		if ($ \#register-form .css \opacity) === '0'
			$ \#register-form .css \display \none
