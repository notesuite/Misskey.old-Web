require '../../../common/scripts/ui.ls'
Album = require '../../../common/scripts/album-core.ls'
$ = require 'jquery/dist/jquery'

$ ->
	album = new Album $ '#album > .misskey-album'
