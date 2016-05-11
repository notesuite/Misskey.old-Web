$ = require 'jquery'
require '../../../common/scripts/ui.ls'

$ ->
	$form = $ \#form
	$textarea = $form.find \textarea
		..focus!
	$submit-button = $form.find '[type="submit"]'
	$progress = $form.find \progress
		..css \display \none

	$form.submit (event) ->
		event.prevent-default!
		$submit-button.attr \disabled on
		$submit-button.find \.text .text LOCALE.sites.mobile.pages._i._post.posting
		$submit-button.find \i .attr \class 'fa fa-spinner fa-spin'
		$progress.css \display \block

		$.ajax "#{CONFIG.urls.api}/web/posts/create-with-file", {
			data: new FormData $form.0
			+async
			-process-data
			-content-type
			headers: {
				'csrf-token': CSRF_TOKEN
			}
			xhr: ->
				XHR = $.ajax-settings.xhr!
				if XHR.upload
					XHR.upload.add-event-listener \progress progress, false
				XHR
		}
		.done ->
			location.href = CONFIG.url
		.fail (err) ->
			$submit-button.attr \disabled off
			$submit-button.find \.text .text LOCALE.sites.mobile.pages._i._post.post
			$submit-button.find \i .attr \class 'fa fa-paper-plane'
			$progress.css \display \none
			alert "#{LOCALE.sites.mobile.pages.i.post.failed}\r\nErrorCode: #{err.response-text}"

		function progress e
			percentage = Math.floor (parse-int e.loaded / e.total * 10000) / 100
			if percentage == 100
				$progress
					..remove-attr \value
					..remove-attr \max
			else
				$progress
					..attr \max e.total
					..attr \value e.loaded
