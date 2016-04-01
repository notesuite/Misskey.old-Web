require '../../../common/scripts/ui.ls'
Album = require '../../../common/scripts/album-core.js'
$ = require 'jquery/dist/jquery'

$ ->
	album = new Album $ '#album > .misskey-album'
