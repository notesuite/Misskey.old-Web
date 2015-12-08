$ = require 'jquery'
attach-fast-click = require 'fastclick'

$.ajax-setup {
	type: \post
	xhr-fields: {+with-credentials}
}

$ ->
	attach-fast-click document.body
