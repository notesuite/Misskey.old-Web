$ = require 'jquery'

module.exports = (file, uploading, success, failed) ->
	data = new FormData!
		..append \file file
	$.ajax "#{config.web-api-url}/web/album/upload" {
		+async
		-process-data
		-content-type
		data: data
		xhr: ->
			XHR = $.ajax-settings.xhr!
			if XHR.upload
				XHR.upload.add-event-listener \progress (e) ->
					percentage = Math.floor (parse-int e.loaded / e.total * 10000) / 100
					uploading e.total, e.loaded, percentage
				, false
			XHR
	}
	.done (file) ->
		success file
	.fail (data) ->
		failed!
