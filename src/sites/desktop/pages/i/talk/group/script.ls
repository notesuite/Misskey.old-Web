$ = require 'jquery'
require '../main.js'

$ ->
	$ 'main > header > .nav > button' .click ->
		$dropdown = $ 'main > header > .nav'

		function close
			$dropdown.attr \data-active \false

		function open
			$ document .click (e) ->
				if !$.contains $dropdown[0], e.target
					close!
			$dropdown.attr \data-active \true

		if ($dropdown.attr \data-active) == \true
			close!
		else
			open!
