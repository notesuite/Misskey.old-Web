$ = require 'jquery/dist/jquery'

window.CSRF_TOKEN = $ 'meta[name="csrf-token"]' .attr \content

$.ajax-setup {
	type: \post
	-cache
	xhr-fields: {+with-credentials}

	# ヘッダーに含めるとCORSのプリフライトが発動して余計な通信が増えるので
	#headers: {
	#	'csrf-token': CSRF_TOKEN
	#}

	data: { '_csrf': CSRF_TOKEN }
}

# Disable Back Forward Cache
window.add-event-listener \unload ->
