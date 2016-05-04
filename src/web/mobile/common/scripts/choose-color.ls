$ = require 'jquery'

module.exports = (cb) ->
	window.MISSKEY_CHOOSE_COLOR_CALLBACK = cb
	window.open CONFIG.colorUrl
