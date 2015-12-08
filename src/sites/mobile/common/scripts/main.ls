$ = require 'jquery'
attach-fast-click = require 'fastclick'
attach-fast-click document.body

$.ajax-setup {
	type: \post
	xhr-fields: {+with-credentials}
}
