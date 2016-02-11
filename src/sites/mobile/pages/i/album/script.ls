$ = require 'jquery/dist/jquery'
require '../../../common/scripts/ui.js'
file-render = require './file.jade'

$ ->
	$files = $ \#files

	$.ajax "#{CONFIG.web-api-url}/album/files/list"
	.done (files) ->
		files.for-each (file) ->
			$file = $ file-render {
				file
				config: CONFIG
			}
			$files.prepend $file
	.fail ->
