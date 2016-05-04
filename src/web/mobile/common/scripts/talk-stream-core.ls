$ = require 'jquery'
marked = require 'marked'
urldecorator = require '../../../common/urldecorator.ls'
message-compiler = require '../views/talk/render.jade'

marked.set-options {
	+gfm
	+breaks
	+sanitize
}

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

		message-type = $message.attr \data-type

		switch (message-type)
		| \user-message, \group-message =>
			if ($message.find '.content > .text').length != 0
				$message.find '.content > .text' .html marked ($message.find '.content > .text' .text!)
				$message.find '.content > .text a' .each ->
					$a = $ @
					$a.add-class \url
					$a.attr \target \_blank
					urldecorator $a

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
			date-info-str = if reverse
				then "#{compare-date.get-full-year!} / #{compare-date.get-month! + 1} / #{compare-date.get-date!}"
				else "#{current-date.get-full-year!} / #{current-date.get-month! + 1} / #{current-date.get-date!}"
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
			config: CONFIG
			me: ME
			message
		}

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
			config: CONFIG
			me: ME
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
