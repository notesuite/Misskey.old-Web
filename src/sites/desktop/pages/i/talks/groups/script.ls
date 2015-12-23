$ = require 'jquery'
require '../../../../common/scripts/main.js'
require '../../../../../common/kronos.js'

$ ->
	header-height = $ '#search' .outer-height!
	$ \main .css \margin-top "#{header-height}px"
