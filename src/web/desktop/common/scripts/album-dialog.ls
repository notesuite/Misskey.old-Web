$ = require 'jquery'
require 'jquery.transit'
album-dialog-compiler = require '../views/album-dialog.jade'
file-compiler = require '../views/album/file.jade'
Album = require './album-core.ls'

class AlbumDialog
	->
		THIS = @

		@default-html-overflow-state = $ \html .css \overflow
		$ \html .css \overflow \hidden

		$album = $ album-dialog-compiler {
			
			me: ME
		}

		$ 'body' .append $album

		@album = new Album $album.find '> .container > .misskey-album'

		@$album = $album
		@$album-background = @$album.find '> .background'
		@$album-container = @$album.find '> .container'
		@$album-core = @$album-container.find '> .album'
		@$album-controller = @$album-container.find '> .controller'
		@$album-chooser = @$album-controller.find '> .chooser'
		@$album-close = @$album-controller.find '> .close'

		@$album-close.click ->
			THIS.close!

		@$album-background.animate {
			opacity: 1
		} 100ms \linear

		@$album-container.css {
			transform: 'scale(1.2)'
			opacity: 0
		}
		@$album-container.transition {
			opacity: \1
			scale: \1
		} 1000ms 'cubic-bezier(0, 1, 0, 1)'

		@$album-background.click ->
			THIS.close!

	close: ->
		THIS = @

		$ \html .css \overflow @default-html-overflow-state
		@$album-background.css \pointer-events \none
		@$album-background.animate {
			opacity: 0
		} 100ms \linear ->
			THIS.$album-background.remove!
		@$album-container.stop!
		@$album-container.css \pointer-events \none
		@$album-container.transition {
			opacity: \0
			scale: \0.8
		} 1000ms 'cubic-bezier(0, 1, 0, 1)' ->
			THIS.$album.remove!

	choose-file: (cb) ->
		THIS = @

		THIS.$album-chooser.css \display \block
		THIS.$album-chooser.find '.submit-button' .one \click ->
			cb THIS.album.get-selected-files!
			THIS.close!

		THIS.album.on-file-dblclicked = ($file) ->
			cb [JSON.parse $file.attr \data-data]
			THIS.close!

module.exports = AlbumDialog
