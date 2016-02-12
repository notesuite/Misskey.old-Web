$ = require 'jquery/dist/jquery'
require '../../../common/scripts/main.js'
require '../../../../common/kronos.js'
upload-file = require '../../../../common/upload-file.js'
Stream = require '../../../common/scripts/talk-stream-core.js'

no-history = no
now-loading = no

function send-message
	$form = $ \#post-form
	$submit-button = $form.find '[type=submit]'

	$submit-button.attr \disabled yes

	data = switch (TALK_TYPE)
		| \user =>
			{
				'text': ($form.find \textarea .val!)
				'user-id': OTHERPARTY.id
				#'files': JSON.stringify(($form.find '.files > li' .map ->
				#	($ @).attr \data-id).get!)
				'file': ($form.find '.files > li:first-child' .attr \data-id)
			}
		| \group =>
			{
				'text': ($form.find \textarea .val!)
				'group-id': GROUP.id
				#'files': JSON.stringify(($form.find '.files > li' .map ->
				#	($ @).attr \data-id).get!)
				'file': ($form.find '.files > li:first-child' .attr \data-id)
			}

	$.ajax "#{CONFIG.web-api-url}/talks/messages/say" {data}
	.done (data) ->
		$form[0].reset!
		$form.find \.files .empty!
	.fail (data) ->
		/*alert('error');*/
	.always ->
		$form.find \textarea .focus!
		$submit-button.attr \disabled no

function upload-new-file(file)
	name = if file.has-own-property \name then file.name else 'untitled'
	$progress = $ "<progress></progress>"
	$ '#post-form > uploads' .append $progress
	upload-file do
		file
		null
		$progress
		(total, uploaded, percentage) ->
		(file) ->
			$progress.remove!
			$thumbnail = $ "<li style='background-image: url(#{file.thumbnail-url});' data-id='#{file.id}' />"
			$remove-button = $ '<button class="remove" title="添付を取り消し"><img src="' + CONFIG.resources-url + '/desktop/common/images/delete.png" alt="remove"></button>'
			$thumbnail.append $remove-button
			$remove-button.click ->
				$thumbnail.remove!
			$ '#post-form > .files' .append $thumbnail

function set-body-margin-top
	$ \body .css \margin-top ($ 'main > header' .outer-height! + \px)

function set-body-margin-bottom
	$ \body .css \margin-bottom ($ \#post-form .outer-height! + \px)

$ window .load ->
	set-body-margin-top!
	set-body-margin-bottom!
	scroll 0, document.body.client-height

$ window .resize ->
	set-body-margin-bottom!

$ ->
	stream = new Stream $ \#stream

	set-body-margin-bottom!
	scroll 0, ($ \html .outer-height!)

	mo = new MutationObserver set-body-margin-bottom
	mo.observe ($ \#post-form).0, {
		+character-data
		+child-list
		+subtree
		+attributes
	}

	socket = init-streaming stream

	# read-more!

	$ '#post-form textarea' .bind \input ->
		text = $ '#post-form textarea' .val!
		socket.emit \type text

	$ '#post-form textarea' .keypress (e) ->
		if (e.char-code == 10 || e.char-code == 13) && e.ctrl-key
			send-message!

	$ '#post-form textarea' .on \paste (event) ->
		items = (event.clipboard-data || event.original-event.clipboard-data).items
		for i from 0 to items.length - 1
			item = items[i]
			if item.kind == \file && item.type.index-of \image != -1
				file = item.get-as-file!
				upload-new-file file

	$ '#post-form > .attach-from-local' .click ->
		$ '#post-form > input[type=file]' .click!
		false

	$ '#post-form > input[type=file]' .change ->
		file = ($ @).0.files.0
		upload-new-file file

	$ \#post-form .submit (event) ->
		event.prevent-default!
		send-message!

	$ '#post-form > .grippie' .mousedown (e) ->
		click-y = e.client-y
		$textarea = $ '#post-form textarea'
		current-height = $textarea.outer-height!

		$ \html .mousemove (me) ->
			height = current-height + (click-y - me.client-y)
			$textarea.css \height "#{height}px"

		$ \html .mouseleave ->
			$ @ .unbind 'mouseup mousemove mouseleave'

		$ \html .mouseup ->
			$ @ .unbind 'mouseup mousemove mouseleave'

		$ \html .bind \dragstart (e) ->
			$ @ .unbind 'mouseup mousemove mouseleave'

		$ \html .bind \dragend (e) ->
			$ @ .unbind 'mouseup mousemove mouseleave'

	$ window .scroll ->
		if $ window .scroll-top! == 0
			read-more!

	function read-more
		if not now-loading and not no-history
			now-loading := yes
			data = switch (TALK_TYPE)
				| \user =>
					{
						'user-id': OTHERPARTY.id
						'limit': 10
						'max-cursor': $ '#stream > .message:first-of-type' .attr \data-cursor
					}
				| \group =>
					{
						'group-id': GROUP.id
						'limit': 10
						'max-cursor': $ '#stream > .message:first-of-type' .attr \data-cursor
					}
			$.ajax "#{CONFIG.web-api-url}/talks/messages/stream" {data}
			.done (messages) ->
				if messages.length > 0
					old-height = $ document .height!
					old-scroll = $ window .scroll-top!
					messages.for-each (message) ->
						stream.add-last message
					$ document .scroll-top old-scroll + ($ document .height!) - old-height
				else
					no-history := yes
					$ '#stream' .prepend $ '<p id="no-history"><i class="fa fa-flag"></i>これより過去の履歴はありません</p>'
			.fail (data) ->
			.always ->
				now-loading := no

function init-streaming(stream)
	endpoint = switch (TALK_TYPE)
		| \user => "#{CONFIG.web-streaming-url}/streaming/talk"
		| \group => "#{CONFIG.web-streaming-url}/streaming/group-talk"
	socket = io.connect endpoint

	socket.on \connected ->
		console.log 'initializing...'
		sign = switch (TALK_TYPE)
			| \user => {'otherparty-id': OTHERPARTY.id}
			| \group => {'group-id': GROUP.id}
		socket.json.emit \init sign

	socket.on \initialized ->
		console.log 'initialized'

	socket.on \disconnect (client) ->
		console.log 'Disconnected'

	socket.on \message (message) ->
		# TODO
		if ($ '#otherparty-status .now-typing')[0]
			$ '#otherparty-status .now-typing' .remove!
		stream.add message
		$.ajax "#{CONFIG.web-api-url}/talks/messages/read" {
			data: {'message-id': message.id}
		}

	socket.on \message-update (message) ->
		$message = $ '#stream' .find ".message[data-id=#{message.id}]"
		if $message?
			$message.find \.text .text message.text

	socket.on \message-delete (id) ->
		$message = $ '#stream' .find ".message[data-id=#{id}]"
		if $message?
			$message.find \.content .empty!
			$message.find \.content .append '<p class="is-deleted">このメッセージは削除されました</p>'

	socket.on \read (id) ->
		set-timeout ->
			$message = $ '#stream' .children ".message[data-id='#{id}']"
			if $message?
				if ($message.attr \data-is-read) == \false
					$message.attr \data-is-read \true
					$message.find \.balloon .prepend ($ '<p class="read">' .text '既読')
		, 100ms

	socket.on \type (type) ->
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

	return socket
