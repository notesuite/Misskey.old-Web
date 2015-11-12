$ ->
	current-location = null
	$album = $ \#misskey-album
	$album-header = $album.find '> header'
	$album-uploads = $album.find '> .uploads'
	$album-uploader = $album-header.find '> .uploader'
	$album-browser = $album.find '> .browser'
	$album-browser-contextmenu = $album-browser.find '> .menu'
	$selection = $album-browser.find '> .selection'
	$album-files = $album-browser.find '> .files'

	function upload(file)
		$album-uploads.css \display \block
		$info = $ "<li><p class='name'>#{file.name}</p><progress></progress></li>"
		$progress-bar = $info.find \progress
		$album-uploads.find \ol .append $info
		data = new FormData!
			..append \file file
		$.ajax config.api-url + '/desktop/album-browser/album/upload' {
			+async
			type: \post
			-process-data
			-content-type
			data: data
			data-type: \json
			xhr-fields: {+with-credentials}
			xhr: ->
				XHR = $.ajax-settings.xhr!
				if XHR.upload
					XHR.upload.add-event-listener \progress (e) ->
						percentage = Math.floor (parse-int e.loaded / e.total * 10000) / 100
						if percentage == 100
							$progress-bar
								..remove-attr \value
								..remove-attr \max
						else
							$progress-bar
								..attr \max e.total
								..attr \value e.loaded
					, false
				XHR
		}
		.done (data) ->
			window.display-message 'アップロードしました'
		.fail (data) ->
			window.display-message 'アップロードに失敗しました。'

	function init-contextmenu($trigger, $menu, shown)
		$trigger.bind \contextmenu (e) ->
			e.stop-immediate-propagation!
			function mousedown(e)
				e.stop-immediate-propagation!
				if e.which == 3
					close!
				if !$.contains $menu[0], e.target
					close!
				false
			function close
				$menu.attr \data-active \false
				$ 'body *' .each ->
					($ @).off \mousedown mousedown
			function open
				$ 'body *' .each ->
					($ @).on \mousedown mousedown
				$menu.attr \data-active \true
				$menu.css {
					top: e.client-y
					left: e.client-x
					opacity: 0
				}
				$menu.animate {
					opacity: 1
				} 100ms
				if shown !== undefined
					shown!
			if ($menu.attr \data-active) == \true
				close!
			else
				open!
			false

	# Init uploader
	$album-uploader.find \button .click ->
		$album-uploader.find \input .click!
		false
	$album-uploader.find \input .change ->
		files = ($album-uploader.find \input)[0].files
		for i from 0 to files.length - 1
			file = files.item i
			upload file

	# Init context menu
	init-contextmenu $album-browser, $album-browser-contextmenu

	# Init selectd area highlighter
	$album-browser.mousedown (e) ->
		left = e.client-x - ($album.position!.left + $album-browser.position!.left) + $album-browser.scroll-left!
		top = e.client-y - ($album.position!.top + $album-browser.position!.top) + $album-browser.scroll-top!
		$selection.stop!
		$selection.css {
			display: \block
			top: top
			left: left
			width: 0
			height: 0
			opacity: 1
		}
		$album-files.find \.file .each ->
			($ @).attr \data-selected \false
		function move(e)
			console.log $album.position!.left
			cursor-x = e.client-x - ($album.position!.left + $album-browser.position!.left) + $album-browser.scroll-left!
			cursor-y = e.client-y - ($album.position!.top + $album-browser.position!.top) + $album-browser.scroll-top!
			w = cursor-x - left
			h = cursor-y - top
			css = {
				opacity: 1
			}
			if w > 0
				css.width = w
				css.left = left
			else
				css.width = -w
				css.left = cursor-x
			if h > 0
				css.height = h
				css.top = top
			else
				css.height = -h
				css.top = cursor-y

			$selection.css css

			# 重なり判定
			selection-top = $selection.offset!.top
			selection-left = $selection.offset!.left
			selection-width = $selection.outer-width!
			selection-height = $selection.outer-height!
			$album-files.find \.file .each ->
				$item = $ @
				item-top = $item.offset!.top
				item-left = $item.offset!.left
				item-width = $item.outer-width!
				item-height = $item.outer-height!
				if ((item-left + item-width) > selection-left) && (item-left < (selection-left + selection-width)) && ((item-top + item-height) > selection-top) && (item-top < (selection-top + selection-height))
					$item.attr \data-selected \true
				else
					$item.attr \data-selected \false
		function up(e)
			$ \html .off \mousemove move
			$ \html .off \mouseup up
			$selection.animate {
				opacity: 0
			} 100ms ->
				$selection.css {
					display: \none
				}
		$ \html .on \mousemove move
		$ \html .on \mouseup up

	load-files!

	function load-files
		$.ajax "#{config.api-url}/desktop/album-browser/album/files" {
			type: \get
			data: {}
			-process-data
			-content-type
			data-type: \text
			xhr-fields: {+with-credentials}}
		.done (html) ->
			$files = $ html
			$album-files.empty!
			$album-files.append $files

			# Init
			$album-files.find \.file .each ->
				$file = $ @
				init-contextmenu $file, ($file.find '> .context-menu'), ->
					$file.attr \data-selected \true
				$file.mousedown (e) ->
					e.stop-immediate-propagation!
				$file.click ->
					is-selected = ($file.attr \data-selected) == \true
					if is-selected
						$file.attr \data-selected \false
					else
						$file.attr \data-selected \true
		.fail ->
			window.display-message '読み込みに失敗しました。再度お試しください。'
