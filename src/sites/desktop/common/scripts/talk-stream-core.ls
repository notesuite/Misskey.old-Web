$ = require 'jquery'
imageviewer = require './image-viewer.js'
message-compiler = require '../views/talk/render.jade'

class Stream
	($stream) ->
		THIS = @

		THIS.$stream = $stream.find '> #messages'
		THIS.$messages = THIS.$stream.children!

		THIS.$messages.each ->
			THIS.init-message $ @

	init-message: ($message) ->
		THIS = @

		imageviewer $message.find '.content > .image'

	check-can-scroll: ->
		$window = $ window
		height = $window.height!
		scroll-top = $window.scroll-top!
		document-height = $ document .height!

		height + scroll-top >= (document-height - 64px)

	add: (message) ->
		THIS = @

		$message = $ message-compiler {
			config,
			me,
			message
		}

		new Audio config.resources-url + '/desktop/common/sounds/message.mp3' .play!

		can-scroll = THIS.check-can-scroll!
		THIS.init-message $message
		$message.append-to THIS.$stream .hide!.show 200ms
		THIS.refresh-my-messages!
		if can-scroll
			scroll 0, ($ document .height!)
			timer = set-interval ->
				scroll 0, ($ document .height!)
			, 1ms
			set-timeout ->
				clear-interval timer
			, 300ms

	add-last: (message) ->
		THIS = @

		$message = $ message-compiler {
			config,
			me,
			message
		}

		THIS.init-message $message
		$message.append-to THIS.$stream
		THIS.refresh-my-messages!

	refresh-my-messages: ->
		THIS = @
		THIS.messages = THIS.$stream.children!

module.exports = Stream
