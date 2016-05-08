$ = require 'jquery'
urldecorator = require '../../../common/urldecorator.ls'
imageviewer = require './image-viewer.ls'

module.exports = (post-type, $content) ->
	switch (post-type)
	| \status, \reply =>
		# Init url preview
		$content.find '> .text a:not(.mention):not(.hashtag)' .each ->
			$link = urldecorator $ @
			if USER_SETTINGS.enable-url-preview-in-post
				$.ajax "#{CONFIG.urls.web-api}/web/url/analyze" {
					data:
						'url': $link.attr \href
					data-type: \text}
				.done (html) ->
					$ html .append-to $content .hide!.fade-in 200ms
		# Images
		$content.find '> .photos > .photo' .each ->
			$image = $ @
			imageviewer $image
