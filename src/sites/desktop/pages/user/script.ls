require '../../common/scripts/ui.js'
$ = require 'jquery'

$ ->
	# Init edit forms
	if window.is-me
		init-avatar-edit-form!
		init-header-image-edit-form!

	if window.is-me
		$ \#name .click ->
			$ 'main > header' .attr \data-name-editing \true

	$ \#screen-name .click ->
		element= document.get-element-by-id \screen-name
		rng = document.create-range!
		rng.select-node-contents element
		window.get-selection!.add-range rng

	$ '#friend-button' .hover do
		->
			if window.is-following
				$ '#friend-button' .add-class \danger
				$ '#friend-button' .text 'フォロー解除'
		->
			if window.is-following
				$ '#friend-button' .remove-class \danger
				$ '#friend-button' .text 'フォロー中'

	$ '#friend-button' .click ->
		$button = $ @
			..attr \disabled on
		if window.is-following
			$.ajax "#{config.web-api-url}/users/unfollow" {
				data: {'user-id': window.user-id}
				data-type: \json}
			.done ->
				$button .remove-class \danger
				$button
					..attr \disabled off
					..remove-class \following
					..add-class \notFollowing
					..text 'フォロー'
				window.is-following = false
			.fail ->
				$button.attr \disabled off
		else
			$.ajax "#{config.web-api-url}/users/follow" {
				data: {'user-id': window.user-id}
				data-type: \json}
			.done ->
				$button
					..attr \disabled off
					..remove-class \notFollowing
					..add-class \following
					..text 'フォロー中'
				window.is-following = true
			.fail ->
				$button.attr \disabled off

	$ window .scroll ->
		top = $ @ .scroll-top!
		height = parse-int($ \#header-data .css \height)
		pos = 50 - ((top / height) * 50)
		$ \#header-data .css \background-position "center #{pos}%"

function init-avatar-edit-form
	$form = $ \#avatar-edit-form
	$submit-button = $form.find '[type=submit]'

	$ \#avatar .click ->
		$ \#avatar-edit-form-back .css \display \block
		$ \#avatar-edit-form-back .animate {
			opacity: 1
		} 500ms \linear
		$ \#avatar-edit-form .css \visibility \visible
		$ \#avatar-edit-form .animate {
			top: 0
			opacity: 1
		} 1000ms \easeOutElastic

	$form.find \.cancel .click ->
		$ \#avatar-edit-form-back .animate {
			opacity: 0
		} 500ms \linear ->
			$ \#avatar-edit-form-back .css \display \none
		$ \#avatar-edit-form .animate {
			top: '-100%'
			opacity: 0
		} 1000ms \easeInOutQuart ->
			$ \#avatar-edit-form .css \visibility \hidden

	$form.submit (event) ->
		event.prevent-default!
		$submit-button.attr \disabled yes
		$submit-button.attr \value '更新しています...'
		$.ajax config.web-api-url + '/account/avatar/update' {
			+async
			-process-data
			-content-type
			data: new FormData $form.0
			data-type: \json
			xhr: ->
				XHR = $.ajax-settings.xhr!
				if XHR.upload
					XHR.upload.add-event-listener \progress (e) ->
						percentage = Math.floor (parse-int e.loaded / e.total * 10000) / 100
						$form.find \progress
							..attr \max e.total
							..attr \value e.loaded
						$form.find '.progress .status' .text "アップロードしています... #{percentage}%"
					, false
				XHR
		}
		.done (data) ->
			location.reload!
		.fail (data) ->
			$submit-button.attr \disabled no
			$submit-button.attr \value '更新 \uf1d8'

	$form.find 'input[name=image]' .change ->
		$input = $ @
		file = $input.prop \files .0
		if file.type.match 'image.*'
			reader = new FileReader!
				..onload = ->
					$submit-button.attr \disabled no
					$ '#avatar-edit-form .preview > .image' .attr \src reader.result
					$ '#avatar-edit-form .preview > .image' .cropper {
						aspect-ratio: 1 / 1
						crop: (data) ->
							$ '#avatar-edit-form input[name=trim-x]' .val Math.round data.x
							$ '#avatar-edit-form input[name=trim-y]' .val Math.round data.y
							$ '#avatar-edit-form input[name=trim-w]' .val Math.round data.width
							$ '#avatar-edit-form input[name=trim-h]' .val Math.round data.height
					}
				..read-as-dataURL file

function init-header-image-edit-form
	$form = $ \#header-image-edit-form
	$submit-button = $form.find '[type=submit]'

	$ \#header-image-edit-button .click ->
		$ \#header-image-edit-form-back .css \display \block
		$ \#header-image-edit-form-back .animate {
			opacity: 1
		} 500ms \linear
		$ \#header-image-edit-form .css \visibility \visible
		$ \#header-image-edit-form .animate {
			top: 0
			opacity: 1
		} 1000ms \easeOutElastic

	$form.find \.cancel .click ->
		$ \#header-image-edit-form-back .animate {
			opacity: 0
		} 500ms \linear ->
			$ \#header-image-edit-form-back .css \display \none
		$ \#header-image-edit-form .animate {
			top: '-100%'
			opacity: 0
		} 1000ms \easeInOutQuart ->
			$ \#header-image-edit-form .css \visibility \hidden

	$form.submit (event) ->
		event.prevent-default!
		$submit-button.attr \disabled yes
		$submit-button.attr \value '更新しています...'
		$.ajax config.web-api-url + '/account/banner/update' {
			+async
			-process-data
			-content-type
			data: new FormData $form.0
			data-type: \json
			xhr: ->
				XHR = $.ajax-settings.xhr!
				if XHR.upload
					XHR.upload.add-event-listener \progress (e) ->
						percentage = Math.floor (parse-int e.loaded / e.total * 10000) / 100
						$form.find \progress
							..attr \max e.total
							..attr \value e.loaded
						$form.find '.progress .status' .text "アップロードしています... #{percentage}%"
					, false
				XHR
		}
		.done (data) ->
			location.reload!
		.fail (data) ->
			$submit-button.attr \disabled no
			$submit-button.attr \value '更新 \uf1d8'

	$form.find 'input[name=image]' .change ->
		$input = $ @
		file = $input.prop \files .0
		if file.type.match 'image.*'
			reader = new FileReader!
				..onload = ->
					$submit-button.attr \disabled no
					$ '#header-image-edit-form .preview > .image' .attr \src reader.result
					$ '#header-image-edit-form .preview > .image' .cropper {
						aspect-ratio: 16 / 9
						crop: (data) ->
							$ '#header-image-edit-form input[name=trim-x]' .val Math.round data.x
							$ '#header-image-edit-form input[name=trim-y]' .val Math.round data.y
							$ '#header-image-edit-form input[name=trim-w]' .val Math.round data.width
							$ '#header-image-edit-form input[name=trim-h]' .val Math.round data.height
					}
				..read-as-dataURL file
