$ = require 'jquery'

module.exports = ($input) ->
	function get-caret
		selection-start = $input[0].selection-start
		selection-end = $input[0].selection-end
		selection-start

	styles = <[
		border-bottom-width
		border-left-width
		border-right-width
		border-top-width
		font-family
		font-size
		font-style
		font-variant
		font-weight
		letter-spacing
		word-spacing
		line-height
		padding-bottom
		padding-left
		padding-right
		padding-top
		text-decoration
	]>

	$dummy-input = $ '<div role="presentation" />'
		..css {
			'position': \absolute
			'pointer-events': \none
			'visibility': \hidden
			'width': $input.width! + 'px'
			'height': $input.height! + 'px'
		}

	styles.for-each (style) ->
		$dummy-input.css style, $input.css style

	$ \body .append $dummy-input

	$dummy-text = $ '<span />'

	$dummy-text-positioner = $ '<span />'
		..html '&nbsp;'

	$dummy-input.append $dummy-text
	$dummy-input.append $dummy-text-positioner

	$input.bind \input ->
		text = $input.val!.substring 0 get-caret!

		$input.parent!.children \.ui-autocomplete .remove!

		id-at-index = text.last-index-of \@

		if id-at-index != -1
			sn = (text.substring id-at-index).replace \@ ''
			if sn.length > 0 and sn.match /^[a-zA-Z0-9_\-]+$/
				$dummy-text.text text
				$dummy-text.html $dummy-text.text!.replace /(\r\n|\r|\n)/g '<br>'
				$dummy-input[0].scroll-top = $dummy-input[0].scroll-height
				$dummy-input.css {
					'width': $input.width! + 'px'
					'height': $input.height! + 'px'
				}

				input-position = $input.position!
				caret-position = $dummy-text-positioner.position!

				$menu = $ '<div class="ui-autocomplete" />'
				$menu.css {
					'position': \absolute
					'top': (input-position.top + caret-position.top) + 'px'
					'left': (input-position.left + caret-position.left) + 'px'
				}

				$input.parent!.append $menu

				# search users
				$.ajax "#{config.web-api-url}/users/search" {
					type: \get
					data: {'screen-name': sn}
					data-type: \json
					xhr-fields: {+with-credentials}}
				.done (result) ->
					if result? and result.length > 0
						$menu.append $ '<ol class="users">'
						result.for-each (user) ->
							$menu.children \ol .append do
								$ \<li> .append do
									$ '<a class="ui-waves-effect">' .attr {
										'href': "#{config.url}/#{user.screen-name}"
										'title': user.comment}
									.append do
										$ '<img class="icon" alt="icon">' .attr \src user.icon-url
									.append do
										$ '<span class="name">' .text user.name
									.append do
										$ '<span class="screen-name">' .text "@#{user.screen-name}"
