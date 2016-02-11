$ = require 'jquery/dist/jquery'
require '../../../common/scripts/ui.js'
init-user-widget = require '../../../common/scripts/init-user-widget.js'

$ ->
	$ 'main > .users > .user' .each ->
		init-user-widget ($ @).children '.user-widget'
