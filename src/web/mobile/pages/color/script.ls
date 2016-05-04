$ = require 'jquery'

$ ->
	$ \body .css \margin-top ($ 'main > h1' .outer-height!) + 'px'

	$ '#colors > .color' .each ->
		$color = $ @
		$color.click ->
			window.opener.MISSKEY_CHOOSE_COLOR_CALLBACK $color.attr \data-color
			window.close!

	$submit = $ \#submit
	$submit.click ->
		window.opener.MISSKEY_CHOOSE_COLOR_CALLBACK $ \#color-hex .val!
		window.close!
