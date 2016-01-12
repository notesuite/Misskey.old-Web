$ = require 'jquery/dist/jquery'
attach-fast-click = require 'fastclick'

window.CSRF_TOKEN = $ 'meta[name="csrf-token"]' .attr \content

$.ajax-setup {
	type: \post
	-cache
	xhr-fields: {+with-credentials}

	data: { '_csrf': CSRF_TOKEN }
}

# Disable Back Forward Cache
window.add-event-listener \unload ->

$ -> attach-fast-click document.body
