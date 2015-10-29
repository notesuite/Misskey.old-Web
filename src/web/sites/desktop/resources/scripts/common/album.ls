$ ->
	current-location = null
	$album = $ \#misskey-album
	$album-browser = $album.find '> .browser'
	$selection = $album-browser.find '> .selection'
	$album-files = $album-browser.find '> .files'
	
	# Init selectd area highlighter
	$album-browser.mousedown (e) ->
		top = e.page-y
		left = e.page-x
		$selection.stop!
		$selection.css {
			display: \block
			top: top
			left: left
			width: 0
			height: 0
			opacity: 1
		}
		function move(e)
			cursor-x = e.page-x
			cursor-y = e.page-y
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
				if ((item-left + item-width) > selection-left && item-left < (selection-left + selection-width))
					$item.attr \data-selected \true
		function up(e)
			console.log 'kyoppie'
			$ \html .off \mousemove move
			$album-browser.off \mouseup up
			$selection.animate {
				opacity: 0
			} 200ms ->
				$selection.css {
					display: \none
				}
		$ \html .on \mousemove move
		$album-browser.on \mouseup up

	load-files!

	function load-files
		$.ajax "#{config.api-url}/web/album/files" {
			type: \get
			data: {}
			-processData
			-contentType
			data-type: \text
			xhr-fields: {+with-credentials}}
		.done (html) ->
			$files = $ html
			$album-files.empty!
			$album-files.append $files
			
			# Init event handlers
			$album-files.find \.file .each ->
				$file = $ @
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
