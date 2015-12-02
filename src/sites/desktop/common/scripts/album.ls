$ = require 'jquery'
require 'jquery.transit'

class Album
	init: ->
		THIS = @
		@current-location = null
		@$album = $ \#misskey-album
		@$album-header = @$album.find '> header'
		@$album-uploads = @$album.find '> .uploads'
		@$album-uploader = @$album-header.find '> .uploader'
		@$album-chooser = @$album-header.find '> .chooser'
		@$album-close = @$album-header.find '> .close'
		@$album-browser = @$album.find '> .browser'
		@$album-browser-contextmenu = @$album-browser.find '> .menu'
		@$selection = @$album-browser.find '> .selection'
		@$album-files = @$album-browser.find '> .files'

		# Init uploader
		THIS.$album-uploader.find \button .click ->
			THIS.$album-uploader.find \input .click!
			false
		THIS.$album-uploader.find \input .change ->
			files = (THIS.$album-uploader.find \input)[0].files
			for i from 0 to files.length - 1
				file = files.item i
				THIS.upload file

		# Init context menu
		THIS.init-contextmenu THIS.$album-browser, THIS.$album-browser-contextmenu

		# Init selectd area highlighter
		THIS.$album-browser.mousedown (e) ->
			left = e.client-x - (THIS.$album.position!.left + THIS.$album-browser.position!.left) + THIS.$album-browser.scroll-left!
			top = e.client-y - (THIS.$album.position!.top + THIS.$album-browser.position!.top) + THIS.$album-browser.scroll-top!
			THIS.$selection.stop!
			THIS.$selection.css {
				display: \block
				top: top
				left: left
				width: 0
				height: 0
				opacity: 1
			}
			THIS.$album-files.find \.file .each ->
				($ @).attr \data-selected \false
			function move(e)
				cursor-x = e.client-x - (THIS.$album.position!.left + THIS.$album-browser.position!.left) + THIS.$album-browser.scroll-left!
				cursor-y = e.client-y - (THIS.$album.position!.top + THIS.$album-browser.position!.top) + THIS.$album-browser.scroll-top!
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

				THIS.$selection.css css

				# 重なり判定
				selection-top = THIS.$selection.offset!.top
				selection-left = THIS.$selection.offset!.left
				selection-width = THIS.$selection.outer-width!
				selection-height = THIS.$selection.outer-height!
				THIS.$album-files.find \.file .each ->
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
				THIS.$selection.animate {
					opacity: 0
				} 100ms ->
					THIS.$selection.css {
						display: \none
					}
			$ \html .on \mousemove move
			$ \html .on \mouseup up

		THIS.$album-close.click ->
			THIS.close!

		THIS.load-files!

	open: (opened-callback) ->
		THIS = @
		THIS.default-html-overflow-state = $ \html .css \overflow
		$ \html .css \overflow \hidden
		$ \#misskey-album .stop!
		$ \#misskey-album-background .stop!
		$ \#misskey-album-container .remove!
		$.ajax "#{config.web-api-url}/web/sites/desktop/album/open" {
			data-type: \text}
		.done (html) ->
			$ 'body' .append $ html
			THIS.init!
			opened-callback!
			$ \#misskey-album-background .animate {
				opacity: 1
			} 100ms \linear

			$ \#misskey-album .css {
				transform: 'scale(1.2)'
				opacity: 0
			}
			$ \#misskey-album .transition {
				opacity: \1
				scale: \1
			} 1000ms 'cubic-bezier(0, 1, 0, 1)'

			$ \#misskey-album-background .click ->
				THIS.close!

	close: ->
		THIS = @
		$ \html .css \overflow THIS.default-html-overflow-state
		$ \#misskey-album-background .css \pointer-events \none
		$ \#misskey-album-background .animate {
			opacity: 0
		} 100ms \linear ->
			if ($ \#misskey-album-background .css \opacity) == \0
				$ \#misskey-album-background .remove!
		$ \#misskey-album .stop!
		$ \#misskey-album .css \pointer-events \none
		$ \#misskey-album .transition {
			opacity: \0
			scale: \0.8
		} 1000ms 'cubic-bezier(0, 1, 0, 1)' ->
			if ($ \#misskey-album .css \opacity) == \0
				$ \#misskey-album .remove!

	choose-file: (cb) ->
		THIS = @

		THIS.open ->
			THIS.$album-chooser.css \display \block
			THIS.$album-chooser.find '.submit-button' .one \click ->
				selected-files = []
				THIS.$album-files.find '> .file[data-selected="true"]' .each ->
					selected-files.push JSON.parse ($ @).attr \data-data
				cb selected-files
				THIS.close!

		THIS.file-opened = ($file) ->
			cb [JSON.parse $file.attr \data-data]
			THIS.close!

	add-file: ($file) ->
		THIS = @
		THIS.$album-files.append $file
		THIS.init-contextmenu $file, ($file.find '> .context-menu'), ->
			$file.attr \data-selected \true
		$file.mousedown (e) ->
			e.stop-immediate-propagation!
		$file.click ->
			is-selected = ($file.attr \data-selected) == \true
			if is-selected
				$file.attr \data-selected \false
			else
				$file.attr \data-selected \true
		$file.dblclick ->
			$file.attr \data-selected \true
			THIS.file-opened $file

	load-files: ->
		THIS = @
		$.ajax "#{config.web-api-url}/web/sites/desktop/album/files" {
			data: {}
			data-type: \text}
		.done (html) ->
			$files = $ html
			THIS.$album-files.empty!
			$files.each ->
				THIS.add-file $ @
		.fail ->
			window.display-message '読み込みに失敗しました。再度お試しください。'

	upload: (file) ->
		THIS = @
		THIS.$album-uploads.css \display \block
		$info = $ "<li><p class='name'>#{file.name}</p><progress></progress></li>"
		$progress-bar = $info.find \progress
		THIS.$album-uploads.find \ol .append $info
		data = new FormData!
			..append \file file
		$.ajax "#{config.web-api-url}/web/sites/desktop/album/upload" {
			+async
			-process-data
			-content-type
			data: data
			data-type: \text
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
		.done (html) ->
			current-location = if THIS.current-location == null then \null else THIS.current-location
			if current-location == ($ html).attr \data-folder-id
				THIS.add-file $ html
		.fail (data) ->
			window.display-message 'アップロードに失敗しました。'

	init-contextmenu: ($trigger, $menu, shown) ->
		THIS = @
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
				left = e.client-x - THIS.$album.position!.left
				top = e.client-y - THIS.$album.position!.top
				$menu.css {
					top
					left
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

module.exports = Album
