$ = require 'jquery/dist/jquery'
require '../../../common/scripts/ui.ls'
init-user-widget = require '../../../common/scripts/init-user-widget.ls'

$ ->
	$ 'main > .users > .user' .each ->
		init-user-widget ($ @).children '.user-widget'
