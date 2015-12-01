$ = require 'jquery'
urldecorator = require './urldecorator.js'
imageviewer = require './image-viewer.js'

module.exports = (post-type, $content) ->
	switch (post-type)
	| \status, \photo =>
		# Init url preview
		$content.find '> .text a:not(.mention):not(.hashtag)' .each ->
			$link = urldecorator $ @
			$.ajax "#{config.web-api-url}/web/analyze-url" {
				data:
					'url': $link.attr \href
				data-type: \text}
			.done (html) ->
				$ html .append-to $content .hide!.fade-in 200ms

	switch (post-type)
	| \photo =>
		# Images
		$content.find '> .photos > .photo' .each ->
			$image = $ @
			imageviewer $image
