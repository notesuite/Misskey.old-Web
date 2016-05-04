$ = require 'jquery'

module.exports = ($elem) ->
	if !$elem? or $elem.length == 0
		return

	$tooltip = null

	mo = new MutationObserver render

	mo.observe $elem[0], {
		attributes: true
		character-data: false
		child-list: false
		attribute-filter: <[ data-tooltip ]>
	}

	$elem.hover do
		->
			$tooltip := $ '<p class="ui-tooltip">'
			$ \body .append $tooltip
			render!
		close

	function render
		if $tooltip?
			$tooltip
				.text $elem.attr \data-tooltip
				.css {
					'top': $elem.offset!.top - $tooltip.outer-height! - 4px
					'left': $elem.offset!.left - ($tooltip.outer-width! / 2) + ($elem.outer-width! / 2)
				}

	function close
		if $tooltip?
			$tooltip.remove!
			$tooltip := null

	function destroy
		mo.disconnect!
		close!
