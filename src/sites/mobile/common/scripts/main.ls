$ = require 'jquery'
attach-fast-click = require 'fastclick'

$.ajax-setup {
	type: \post
	-cache
	xhr-fields: {+with-credentials}
}

window.add-event-listener \unload ->

$ ->
	attach-fast-click document.body
