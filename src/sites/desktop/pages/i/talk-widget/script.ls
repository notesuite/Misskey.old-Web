$ = require 'jquery'
Stream = require '../../../common/scripts/talk-stream-core.js'
require '../../../common/scripts/kronos.js'

function send-message
	$form = $ \#post-form
	$submit-button = $form.find '[type=submit]'

	$submit-button.attr \disabled yes

	$.ajax "#{config.web-api-url}/talks/say" {
		type: \post
		data:
			'text': ($form.find \textarea .val!)
			'otherparty-id': ($ \html .attr \data-otherparty-id)
		xhr-fields: {+with-credentials}
	} .done (data) ->
		$form[0].reset!
		$form.find \textarea .focus!
		$submit-button.attr \disabled no
	.fail (data) ->
		$form[0].reset!
		$form.find \textarea .focus!
		/*alert('error');*/
		$submit-button.attr \disabled no

$ ->
	me-id = $ \html .attr \data-me-id
	me-sn = $ \html .attr \data-me-screen-name
	otherparty-id = $ \html .attr \data-otherparty-id
	otherparty-sn = $ \html .attr \data-otherparty-screen-name
	otherparty-icon-image-url = $ \html .attr \data-otherparty-icon-image-url

	stream = new Stream $ '#stream'

	$ \body .css \margin-bottom ($ '#post-form-container' .outer-height! + \px)
	scroll 0, ($ \html .outer-height!)

	socket = io.connect "#{config.web-streaming-url}/streaming/talk"

	socket.on \connected ->
		console.log 'Connected'
		socket.json.emit \init {
			'otherparty-id': otherparty-id
		}

	socket.on \inited ->
		console.log 'Inited'
		socket.emit \alive
		$ '.messages .message.otherparty' .each ->
			socket.emit \read ($ @ .attr \data-id)

	socket.on \disconnect (client) ->
		console.log 'Disconnected'

	socket.on \otherparty-enter-the-talk (client) ->
		console.log '相手が入室しました'

	socket.on \otherparty-left-the-talk (client) ->
		console.log '相手が退室しました'

	socket.on \otherparty-message (message) ->
		console.log \otherparty-message message
		$message = $ message
		message-id = $message.attr \data-id
		socket.emit \read message-id
		if ($ '#otherparty-status #otherparty-typing')[0]
			$ '#otherparty-status #otherparty-typing' .remove!
		stream.add $message
		$.ajax "#{config.api-url}/talks/read" {
			type: \post
			data: {'message-id': message-id}
			xhr-fields: {+with-credentials}
		}

	socket.on \me-message (message) ->
		console.log \me-message message
		stream.add $ message

	socket.on \otherparty-message-update (message) ->
		console.log \otherparty-message-update message
		$message = $ '#stream > .messages' .find ".message[data-id=#{message.id}]"
		if $message?
			$message.find \.text .text message.text

	socket.on \me-message-update (message) ->
		console.log \me-message-update message
		$message = $ '#stream > .messages' .find ".message[data-id=#{message.id}]"
		if $message?
			$message.find \.text .text message.text

	socket.on \otherparty-message-delete (id) ->
		console.log \otherparty-message-delete id
		$message = $ '#stream > .messages' .find ".message[data-id=#{id}]"
		if $message?
			$message.find \.content .empty!
			$message.find \.content .append '<p class="is-deleted">このメッセージは削除されました</p>'

	socket.on \me-message-delete (id) ->
		console.log \me-message-delete id
		$message = $ '#stream > .messages' .find ".message[data-id=#{id}]"
		if $message?
			$message.find \.content .empty!
			$message.find \.content .append '<p class="is-deleted">このメッセージは削除されました</p>'

	socket.on \read (id) ->
		console.log \read id
		$message = $ '#stream > .messages' .find ".message[data-id=#{id}]"
		if $message?
			if ($message.attr \data-is-readed) == \false
				$message.attr \data-is-readed \true
				$message.find \.content-container .prepend ($ '<p class="readed">' .text '既読')

	socket.on \alive ->
		console.log 'alive'
		$status = $ "<img src=\"#{otherparty-icon-image-url}\" alt=\"icon\" id=\"alive\">"
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
		if ($ '#otherparty-status #otherparty-typing')[0]
			$ '#otherparty-status #otherparty-typing' .remove!
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
				'max-cursor': $ '#stream > .messages > .message:first-child > .message' .attr \data-cursor
			data-type: \text
			xhr-fields: {+with-credentials}}
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
