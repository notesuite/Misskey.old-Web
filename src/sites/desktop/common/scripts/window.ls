$ = require 'jquery'

module.exports = (id, $content, title, width, height, can-popout = false) ->
	$window = $ '''
		<div class="ui-window" id="''' + id + '''">
			<header>
				<h1>''' + title + '''</h1>
				<div class="buttons">
					<button class="popout" title="ポップアウト"><i class="fa fa-external-link"></i></button>
					<button class="close" title="閉じる"><i class="fa fa-times"></i></button>
				</div>
			</header>
			<div class="content"></div>
		</div>
	''' .css {
		width
		height
	}
	$window.find \.content .append $content
	$ \body .prepend $window

	function top
		window.window-z = 0
		$ \.ui-window .each ->
			if ($ @ .css \z-index) > window.window-z
				window.window-z = Number($ @ .css \z-index)
		$window.css \z-index window.window-z + 1

	function popout
		console.log ($content.contents!.get 0 .location.href)
		url = $content.contents!.get 0 .location.href
		title = $content.contents!.get 0 .title
		opened-window = window.open do
			url
			title
			"
				width=#{width},
				height=#{height},
				menubar=no,
				toolbar=no,
				location=no,
				status=no
			"
		close!

	function close
		$window.css {
			transform: 'perspective(512px) rotateX(22.5deg) scale(0.9)'
			opacity: \0
			transition: 'all ease-in 0.3s'
		}
		set-timeout ->
			$window.remove!
		, 300ms

	function end-move
		$window.find \.content .css {
			'pointer-events': \auto
			'user-select': \auto
		}

	$window.ready ->
		top!

		$window.css {
			bottom: (($ window .height! / 2) - ($window.height! / 2) + ((Math.random! * 128) - 64)) + \px
			right: (($ window .width! / 2) - ($window.width! / 2) + ((Math.random! * 128) - 64)) + \px
		}
		$window.animate {
			opacity: \1
			transform: 'scale(1)'
		}, 200ms

	$window.find 'header > .buttons > .popout' .click popout

	$window.find 'header > .buttons > .close' .click close

	$window.mousedown top

	$window.find \header .mousedown (e) ->
		| $ e.target .is \button =>
		| $ e.target .is \img =>
		| _ =>
			$window.find \.content .css {
				'pointer-events': \none
				'user-select': \none
			}

			position = $window.position!

			click-x = e.client-x
			click-y = e.client-y
			move-base-x = click-x - position.left
			move-base-y = click-y - position.top
			browser-width = $ window .width!
			browser-height = $ window .height!
			window-width = $window.outer-width!
			window-height = $window.outer-height!
			page-top = parse-int ($ \body .css \margin-top)

			$ \html .mousemove (me) ->
				$window.remove-class \snap-top
				$window.remove-class \snap-right
				$window.remove-class \snap-bottom
				$window.remove-class \snap-left

				move-left = me.client-x - move-base-x
				move-top = me.client-y - move-base-y

				if move-left < 0
					move-left = 0

				if move-top < page-top
					move-top = page-top

				if move-left + window-width > browser-width
					move-left = browser-width - window-width

				if move-top + window-height > browser-height
					move-top = browser-height - window-height

				# snap window border
				threshold = 16px

				if move-left + window-width > browser-width - threshold
					$window.add-class \snap-right
					move-left = browser-width - window-width

				if move-top + window-height > browser-height - threshold
					$window.add-class \snap-bottom
					move-top = browser-height - window-height

				if move-left < threshold
					$window.add-class \snap-left
					move-left = 0

				if (move-top - page-top) < threshold
					$window.add-class \snap-top
					move-top = page-top

				$window.css {
					left: move-left + \px
					top: move-top + \px
				}

			$ \html .mouseleave ->
				$ @ .unbind 'mouseup mousemove mouseleave'
				end-move!

			$ \html .mouseup ->
				$ @ .unbind 'mouseup mousemove mouseleave'
				end-move!

			$ \html .bind \dragstart (e) ->
				$ @ .unbind 'mouseup mousemove mouseleave'
				end-move!

			$ \html .bind \dragend (e) ->
				$ @ .unbind 'mouseup mousemove mouseleave'
				end-move!

	$ window .resize ->
		position = $window.position!
		browser-width = $ window .width!
		browser-height = $ window .height!
		window-width = $window.outer-width!
		window-height = $window.outer-height!
		page-top = parse-int ($ \body .css \margin-top)

		if position.left < 0
			$window.css {
				left: 0
			}

		if position.top < page-top
			$window.css {
				top: page-top
			}

		if position.left + window-width > browser-width
			$window.css {
				left: 0
			}

		if position.top + window-height > browser-height
			$window.css {
				top: page-top
			}

		if $window.has-class \snap-top
			$window.css {
				top: page-top
			}

		if $window.has-class \snap-right
			$window.css {
				left: browser-width - window-width + \px
			}

		if $window.has-class \snap-bottom
			$window.css {
				top: browser-height - window-height + \px
			}

		if $window.has-class \snap-left
			$window.css {
				left: 0
			}
