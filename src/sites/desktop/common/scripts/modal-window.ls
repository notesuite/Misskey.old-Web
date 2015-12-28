$ = require 'jquery'
require 'jquery.transit'

module.exports = ($content, can-close = true, on-shown = null, klass = null) ->
	default-html-overflow-state = $ \html .css \overflow
	$ \html .css \overflow \hidden

	$dialog = $ '<div class="ui-modal-window" />'
		..add-class klass
		..css \max-width $content.css \max-width
		..append $content

	$container = $ '<div class="ui-modal-window-container" />'
		..append $dialog

	$ \body .append $container

	$container.animate {
		opacity: 1
	} 100ms \linear

	$dialog.css {
		transform: 'scale(1.2)'
		opacity: 0
	}
	$dialog.transition {
		opacity: \1
		scale: \1
	} 1000ms 'cubic-bezier(0, 1, 0, 1)'

	if on-shown?
		on-shown!

	function keydown(e)
		if e.which == 13 or e.which == 27
			e.prevent-default!
			e.stop-immediate-propagation!
			close!

	if can-close
		$container.click ->
			close!
		$ document .on \keydown keydown
	else
		$container.mousedown ->
			$content.transition {
				scale: '1.1'
			} 100ms \ease
			.transition {
				scale: '1'
			} 100ms \ease

	$dialog.mousedown (e) ->
		e.stop-immediate-propagation!
	$dialog.click (e) ->
		e.stop-immediate-propagation!

	function close
		$ document .off \keydown keydown

		$ \html .css \overflow default-html-overflow-state
		$container.animate {
			opacity: 0
		} 100ms \linear -> $container.remove!
		$dialog.stop!
		$dialog.transition {
			opacity: \0
			scale: \0.8
		} 1000ms 'cubic-bezier(0, 1, 0, 1)' ->
			$dialog.remove!
