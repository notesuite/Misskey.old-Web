$ = require 'jquery'
require 'jquery.transit'

module.exports = ($content, can-close = true, on-shown = null) ->
	$container = $ '<div class="ui-modal-window-container" />'
	$dialog = $ '<div class="ui-modal-window" />'
	$dialog.append $content
	$container.append $dialog
	$ \body .append $container

	$dialog.css \max-width $content.css \max-width

	$container.animate {
		opacity: 1
	} 100ms \linear

	$content.css {
		transform: 'scale(1.2)'
		opacity: 0
	}
	$content.transition {
		opacity: \1
		scale: \1
	} 1000ms 'cubic-bezier(0, 1, 0, 1)'

	if on-shown?
		on-shown!

	$container.click ->
		if can-close
			close!
		else
			$content.transition {
				scale: '1.1'
			} 50ms \ease
			.transition {
				scale: '1'
			} 50ms \ease

	$dialog.click (e) ->
		e.stop-immediate-propagation!

	function close
		$container.animate {
			opacity: 0
		} 100ms \linear -> $container.remove!
		$dialog.stop!
		$dialog.transition {
			opacity: \0
			scale: \0.8
		} 1000ms 'cubic-bezier(0, 1, 0, 1)' ->
			$dialog.remove!
