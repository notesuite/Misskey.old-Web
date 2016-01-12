$ = require 'jquery/dist/jquery'

module.exports = (file, $progress, uploading, success, failed) ->
	data = new FormData!
		..append \file file
	$.ajax "#{CONFIG.web-api-url}/web/album/upload" {
		+async
		-process-data
		-content-type
		data: data
		headers: {
			'csrf-token': CSRF_TOKEN
		}
		xhr: ->
			XHR = $.ajax-settings.xhr!
			if XHR.upload
				XHR.upload.add-event-listener \progress progress, false
			XHR
	}
	.done (file) ->
		success file
	.fail (data) ->
		failed!

	function progress e
		percentage = Math.floor (parse-int e.loaded / e.total * 10000) / 100
		if $progress?
			if percentage == 100
				$progress
					..remove-attr \value
					..remove-attr \max
			else
				$progress
					..attr \max e.total
					..attr \value e.loaded
		if uploading?
			uploading e.total, e.loaded, percentage
