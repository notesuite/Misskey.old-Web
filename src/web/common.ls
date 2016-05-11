$ = require 'jquery'

CONFIG = require 'config'

window.CONFIG = window.config = CONFIG
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
