$ = require 'jquery'

CSRF_TOKEN = $ 'meta[name="csrf_token"]' .attr \content

$.ajax-setup {
	type: \post
	-cache
	xhr-fields: {+with-credentials}
	headers: {
		'csrf-token': CSRF_TOKEN
	}
}

window.add-event-listener \unload ->
