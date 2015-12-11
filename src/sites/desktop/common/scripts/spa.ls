$ = require 'jquery'

module.exports = ->
	$ \body .find \a .each ->
		$a = $ @
		href = $a.attr \href
		if !href?
			return
		if (href.0 == \/) or (href.substring 0, config.url.length) == config.url
			if ($a.attr \data-spalize) == \true
				return
			$a.attr \data-spalize \true
			$a.click (e) ->
				e.prevent-default!
				$ \body .css \opacity \0.5
				$.ajax href, {
					type: \get
				}
				.done (data) ->
					console.clear!
					document.open!
					document.write data
					document.close!
					history.push-state '' '' href
				.fail ->
					$ \body .css \opacity \1
				false
