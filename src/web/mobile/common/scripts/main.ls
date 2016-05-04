$ = require 'jquery'
attach-fast-click = require 'fastclick/lib/fastclick.js'

window.CSRF_TOKEN = $ 'meta[name="csrf-token"]' .attr \content

$.ajax-setup {
	type: \post
	-cache
	xhr-fields: {+with-credentials}
	data: { '_csrf': CSRF_TOKEN }
}

$ -> attach-fast-click document.body
