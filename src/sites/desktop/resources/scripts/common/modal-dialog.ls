$ = require 'jquery'
require 'jquery.transit'

module.exports = ($content) ->
	$container = $ '<div class="ui-modal-dialog-container" />'
	$dialog = $ '<div class="ui-modal-dialog" />'
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

	$container.click ->
		close!

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
