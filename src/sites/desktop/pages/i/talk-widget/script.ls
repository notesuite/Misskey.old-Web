$ = require 'jquery'
require '../../../common/scripts/main.js'
Stream = require '../../../common/scripts/talk-stream-core.js'
require '../../../common/scripts/kronos.js'

function send-message
	$form = $ \#post-form
	$submit-button = $form.find '[type=submit]'

	$submit-button.attr \disabled yes

	$.ajax "#{config.web-api-url}/talks/say" {
		data:
			'text': ($form.find \textarea .val!)
			'otherparty-id': OTHERPARTY.id
	}
	.done (data) ->
		$form[0].reset!
	.fail (data) ->
		/*alert('error');*/
	.always ->
		$form.find \textarea .focus!
		$submit-button.attr \disabled no

$ ->
	stream = new Stream $ '#stream'

	$ \body .css \margin-bottom ($ '#post-form-container' .outer-height! + \px)
	scroll 0, ($ \html .outer-height!)

	socket = io.connect "#{config.web-streaming-url}/streaming/sites/desktop/talk"

	socket.on \connected ->
		socket.json.emit \init {
			'otherparty-id': OTHERPARTY.id
		}

	socket.on \inited ->
		socket.emit \alive
		$ '#messages .message.otherparty' .each ->
			socket.emit \read ($ @ .attr \data-id)

	socket.on \disconnect (client) ->
		console.log 'Disconnected'

	socket.on \otherparty-message (message) ->
		socket.emit \read message.id
		if ($ '#otherparty-status .now-typing')[0]
			$ '#otherparty-status .now-typing' .remove!
		stream.add message
		$.ajax "#{config.api-url}/talks/read" {
			data: {'message-id': message.id}
		}

	socket.on \me-message (message) ->
		stream.add message

	socket.on \otherparty-message-update (message) ->
		$message = $ '#messages' .find ".message[data-id=#{message.id}]"
		if $message?
			$message.find \.text .text message.text

	socket.on \me-message-update (message) ->
		$message = $ '#messages' .find ".message[data-id=#{message.id}]"
		if $message?
			$message.find \.text .text message.text

	socket.on \otherparty-message-delete (id) ->
		$message = $ '#messages' .find ".message[data-id=#{id}]"
		if $message?
			$message.find \.content .empty!
			$message.find \.content .append '<p class="is-deleted">このメッセージは削除されました</p>'

	socket.on \me-message-delete (id) ->
		$message = $ '#messages' .find ".message[data-id=#{id}]"
		if $message?
			$message.find \.content .empty!
			$message.find \.content .append '<p class="is-deleted">このメッセージは削除されました</p>'

	socket.on \read (id) ->
		$message = $ '#messages' .find ".message[data-id=#{id}]"
		if $message?
			if ($message.attr \data-is-readed) == \false
				$message.attr \data-is-readed \true
				$message.find \.content-container .prepend ($ '<p class="readed">' .text '既読')

	socket.on \alive ->
		$status = $ "<img src=\"#{OTHERPARTY.avatar-url}\" alt=\"avatar\" id=\"alive\">"
		if ($ '#otherparty-status #alive')[0]
			$ '#otherparty-status #alive' .remove!
		else
			$status.add-class \opening
		$ \#otherparty-status .prepend $status
		set-timeout ->
			$status.add-class \normal
			$status.remove-class \opening
		, 500ms
		set-timeout ->
			$status.add-class \closing
			set-timeout ->
				$status.remove!
			, 1000ms
		, 3000ms

	socket.on \type (type) ->
		console.log \type type
		if ($ '#otherparty-status .now-typing')[0]
			$ '#otherparty-status .now-typing' .remove!
		if type != ''
			$typing = $ "<p id=\"otherparty-typing\">#{window.escapeHTML type}</p>"
			$typing.append-to $ \#otherparty-status .animate {
				opacity: 0
			} 5000ms
			set-timeout ->
				$typing.remove!
			, 5000ms

	# Send alive signal
	set-interval ->
		socket.emit \alive
	, 2000ms

	$ '#post-form textarea' .bind \input ->
		text = $ '#post-form textarea' .val!
		socket.emit \type text

	$ '#post-form textarea' .keypress (e) ->
		if (e.char-code == 10 || e.char-code == 13) && e.ctrl-key
			send-message!

	$ \#post-form .submit (event) ->
		event.prevent-default!
		send-message!

	$ '#read-more' .click ->
		$button = $ @
		$button.attr \disabled yes
		$button.text '読み込み中'
		$.ajax "#{config.web-api-url}/web/desktop/talks/stream" {
			data:
				'otherparty-id': otherparty-id
				'max-cursor': $ '#messages > .message:first-child > .message' .attr \data-cursor
			data-type: \text}
		.done (data) ->
			$button.attr \disabled no
			$button.text 'もっと読み込む'
			$messages = $ data
			$messages.each ->
				$message = $ @
				stream.add-last $message
		.fail (data) ->
			$button.attr \disabled no
			$button.text '失敗'

$ window .load ->
	$ \body .css \margin-bottom ($ \#post-form-container .outer-height! + \px)
	scroll 0, document.body.client-height

$ window .resize ->
	$ \body .css \margin-bottom ($ \#post-form-container .outer-height! + \px)
