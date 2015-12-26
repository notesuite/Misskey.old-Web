$ = require 'jquery'
urldecorator = require './urldecorator.js'

module.exports = (post-type, $content) ->
	switch (post-type)
	| \status, \photo =>
		# Init url preview
		$content.find '> .text a:not(.mention):not(.hashtag)' .each ->
			$link = urldecorator $ @
			$.ajax "#{CONFIG.web-api-url}/web/url/analyze" {
				data:
					'url': $link.attr \href
				data-type: \text}
			.done (html) ->
				$ html .append-to $content
