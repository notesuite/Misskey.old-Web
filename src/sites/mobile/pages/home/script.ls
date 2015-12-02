require '../../common/scripts/ui.js'
$ = require 'jquery'
Timeline = require '../../common/scripts/timeline-core.js'

$ ->
	timeline = new Timeline $ '#widget-timeline > .timeline'

	socket = io.connect config.web-streaming-url + '/streaming/home'

	$ \body .append $ '<p class="streaming-info"><i class="fa fa-spinner fa-spin"></i>ストリームに接続しています...</p>'

	socket.on \connect ->
		$ 'body > .streaming-info' .remove!
		$message = $ '<p class="streaming-info"><i class="fa fa-check"></i>ストリームに接続しました</p>'
		$ \body .append $message
		set-timeout ->
			$message.animate {
				opacity: 0
			} 200ms \linear ->
				$message.remove!
		, 1000ms

	socket.on \disconnect (client) ->
		if $ 'body > .streaming-info.reconnecting' .length == 0
			$ 'body > .streaming-info' .remove!
			$message = $ '<p class="streaming-info reconnecting"><i class="fa fa-spinner fa-spin"></i>ストリームから切断されました 再接続中...</p>'
			$ \body .append $message
