$ = require 'jquery'
imageviewer = require './image-viewer.js'
message-compiler = require '../views/talk/render.jade'

class Stream
	($stream) ->
		THIS = @

		THIS.$stream = $stream
		THIS.$messages = THIS.$stream.children!

		THIS.$messages.each ->
			$message = $ @
			THIS.init-message $message
			THIS.init-date-info $message

	init-message: ($message) ->
		THIS = @

		imageviewer $message.find '.content > .image'

	init-date-info: ($message, reverse = no) ->
		$compare-message =
			if reverse
			then $message.next \.message
			else $message.prev \.message
		if $compare-message.length == 0
			return
		compare-date = new Date $compare-message.attr \data-created-at
		current-date = new Date $message.attr \data-created-at
		if compare-date.get-date! != current-date.get-date!
			date-info-str = "#{current-date.get-full-year!} / #{current-date.get-month! + 1} / #{current-date.get-date!}"
			$date-info = $ '<div class="date"><p>' + date-info-str + '</p></div>'
			if reverse
				$message.after $date-info
			else
				$message.before $date-info


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
		THIS.init-date-info $message
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
		$message.prepend-to THIS.$stream
		THIS.init-date-info $message, yes
		THIS.refresh-my-messages!

	refresh-my-messages: ->
		THIS = @
		THIS.messages = THIS.$stream.children!

module.exports = Stream
