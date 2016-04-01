$ = require 'jquery/dist/jquery'
urldecorator = require './urldecorator.ls'

module.exports = (post-type, $content) ->
	switch (post-type)
	| \status, \photo =>
		# Init url preview
		$content.find '> .text a:not(.mention):not(.hashtag)' .each ->
			$link = urldecorator $ @
			if USER_SETTINGS.enable-url-preview-in-post
				$.ajax "#{CONFIG.web-api-url}/web/url/analyze" {
					data:
						'url': $link.attr \href
					data-type: \text}
				.done (html) ->
					$ html .append-to $content
