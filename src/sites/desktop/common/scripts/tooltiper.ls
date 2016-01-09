$ = require 'jquery/dist/jquery'

module.exports = ($elem) ->
	$tooltip = $ '<p class="ui-tooltip">' .text $elem.attr \data-tooltip
	$elem.hover do
		->
			$tooltip.css \bottom $elem.outer-height! + 4px
			$elem.append $tooltip
			$elem.find \.ui-tooltip .css \left ($elem.outer-width! / 2) - ($tooltip.outer-width! / 2)
		->
			$elem.find \.ui-tooltip .remove!
