$ = require 'jquery'
urldecorator = require './urldecorator.js'

module.exports = (post-type, $content) ->
	switch (post-type)
	| \status, \photo =>
		# Init url preview
		$content.find '> .text a:not(.mention):not(.hashtag)' .each ->
			$link = urldecorator $ @
			$.ajax "#{config.web-api-url}/web/analyze-url" {
				type: \get
				data:
					'url': $link.attr \href
				data-type: \text
				xhr-fields: {+with-credentials}}
			.done (html) ->
				$ html .append-to $content .hide!.fade-in 200ms

	switch (post-type)
	| \photo =>
		# Images
		$content.find '> .photos > .photo' .each ->
			$image = $ @
			$img = $image.find \img
			$button = $image.find \button
			$back = $image.find \.background

			$img.css {
				'cursor': 'zoom-in'
			}

			$img.click ->
				if ($image.attr \data-is-expanded) == \true
					$image.attr \data-is-expanded \false
					$back.animate {
						opacity: 0
					} 100ms \linear ->
						$back.css \display \none
			$back.click ->
				if ($image.attr \data-is-expanded) == \true
					$image.attr \data-is-expanded \false
					$back.animate {
						opacity: 0
					} 100ms \linear ->
						$back.css \display \none
			$button.click ->
				if ($image.attr \data-is-expanded) == \true
					$image.attr \data-is-expanded \false
					$back.animate {
						opacity: 0
					} 100ms \linear ->
						$back.css \display \none
				else
					$image.attr \data-is-expanded \true
					$back.css \display \block
					$back.animate {
						opacity: 1
					} 100ms \linear
