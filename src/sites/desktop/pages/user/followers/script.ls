$ = require 'jquery/dist/jquery'
require '../../../common/scripts/ui.js'
init-user-card = require '../../../common/scripts/init-user-card.js'

$ ->
	$ 'main > .users > .user' .each ->
		init-user-card ($ @).children '.ui-user-card'
