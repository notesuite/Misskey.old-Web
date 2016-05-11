$ = require 'jquery'

module.exports = (file, folder, $progress, uploading, success, failed, always) ->
	data = new FormData!
		..append \file file
		..append \folder folder
	$.ajax "#{CONFIG.urls.api}/web/album/upload" {
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
		if success?
			success file
	.fail (data) ->
		if failed?
			failed!
	.always ->
		if always?
			always!

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
