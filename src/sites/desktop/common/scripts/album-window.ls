$ = require 'jquery'
require 'jquery.transit'
album-compiler = require '../views/album-window.jade'
file-compiler = require '../views/album/file.jade'
Album = require './album-core.js'

class AlbumWindow
	init: ->
		THIS = @
		THIS.album = new Album!
		@$album = $ \#misskey-album
		@$album-header = @$album.find '> header'
		@$album-chooser = @$album-header.find '> .chooser'
		@$album-close = @$album-header.find '> .close'

		THIS.$album-close.click ->
			THIS.close!

	open: (opened-callback) ->
		THIS = @
		THIS.default-html-overflow-state = $ \html .css \overflow
		$ \html .css \overflow \hidden
		$ \#misskey-album .stop!
		$ \#misskey-album-background .stop!
		$ \#misskey-album-container .remove!

		html = album-compiler {
			config: CONFIG
			me: ME
		}

		$ 'body' .append $ html
		THIS.init!
		opened-callback!
		$ \#misskey-album-background .animate {
			opacity: 1
		} 100ms \linear

		$ \#misskey-album .css {
			transform: 'scale(1.2)'
			opacity: 0
		}
		$ \#misskey-album .transition {
			opacity: \1
			scale: \1
		} 1000ms 'cubic-bezier(0, 1, 0, 1)'

		$ \#misskey-album-background .click ->
			THIS.close!

	close: ->
		THIS = @
		$ \html .css \overflow THIS.default-html-overflow-state
		$ \#misskey-album-background .css \pointer-events \none
		$ \#misskey-album-background .animate {
			opacity: 0
		} 100ms \linear ->
			if ($ \#misskey-album-background .css \opacity) == \0
				$ \#misskey-album-background .remove!
		$ \#misskey-album .stop!
		$ \#misskey-album .css \pointer-events \none
		$ \#misskey-album .transition {
			opacity: \0
			scale: \0.8
		} 1000ms 'cubic-bezier(0, 1, 0, 1)' ->
			if ($ \#misskey-album .css \opacity) == \0
				$ \#misskey-album .remove!

	choose-file: (cb) ->
		THIS = @

		THIS.open ->
			THIS.$album-chooser.css \display \block
			THIS.$album-chooser.find '.submit-button' .one \click ->
				cb THIS.album.get-selected-files!
				THIS.close!

		THIS.album.on-file-dblclicked = ($file) ->
			cb [JSON.parse $file.attr \data-data]
			THIS.close!

module.exports = AlbumWindow
