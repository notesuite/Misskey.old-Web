require '../../../common/scripts/ui.js'
Album = require '../../../common/scripts/album-core.js'
$ = require 'jquery/dist/jquery'

$ ->
	album = new Album $ '#album > .misskey-album'
