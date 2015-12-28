$ = require 'jquery'

$.ajax-setup {
	type: \post
	-cache
	xhr-fields: {+with-credentials}
}

window.addEventListener 'unload', ->
