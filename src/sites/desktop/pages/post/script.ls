$ = require 'jquery/dist/jquery'
Sortable = require 'Sortable'
require '../../common/scripts/ui.js'
sncompleter = require '../../common/scripts/sncompleter.js'
tooltiper = require '../../common/scripts/tooltiper.js'
AlbumDialog = require '../../common/scripts/album-dialog.js'
post-content-initializer = require '../../common/scripts/post-content-initializer.js'
sub-post-compiler = require '../../common/views/post/detail/sub-post-render.jade'

function init-post($post)
	post-type = $post.attr \data-type

	$reply-form = $post.find '> .reply-form'

	Sortable.create ($reply-form.find '.photos')[0], {
		animation: 150ms
	}

	sncompleter $reply-form.find 'textarea'

	post-content-initializer post-type, $post.find '> .main > .content'

	$reply-form
		..find 'textarea' .on \paste (event) ->
			items = (event.clipboard-data || event.original-event.clipboard-data).items
			for i from 0 to items.length - 1
				item = items[i]
				if item.kind == \file && item.type.index-of \image != -1
					file = item.get-as-file!
					upload-new-file file

		..find 'textarea' .keypress (e) ->
			if (e.char-code == 10 || e.char-code == 13) && e.ctrl-key
				submit-reply!

		..find '.attach-from-album' .click ->
			album = new AlbumDialog
			album.choose-file (files) ->
				files.for-each (file) ->
					add-file file

		..find '.attach-from-local' .click ->
			$reply-form.find 'input[type=file]' .click!
			return false

		..find 'input[type=file]' .change ->
			files = ($reply-form.find 'input[type=file]')[0].files
			for i from 0 to files.length - 1
				file = files.item i
				upload-new-file file

		..submit (event) ->
			event.prevent-default!
			submit-reply!

	$post.find '> .main > .likes-and-reposts .users > .user > a' .each ->
		tooltiper $ @

	function submit-reply
		$submit-button = $reply-form.find \.submit-button
			..attr \disabled on
			..text 'Replying...'

		$.ajax "#{CONFIG.web-api-url}/posts/reply" {
			data:
				'text': ($reply-form.find \textarea .val!)
				'in-reply-to-post-id': ($post.attr \data-id)
				'files': ($reply-form.find '.photos > li' .map ->
					$ @ .attr \data-id).get!.join \,
		}
		.done (post) ->
			$reply = $ sub-post-compiler {
				post
				config: CONFIG
				me: ME
				user-settings: USER_SETTINGS
				locale: LOCALE
			}
			$reply.prepend-to $post.find '> .replies'
			$reply-form.remove!
		.fail ->
			window.display-message '返信に失敗しました。再度お試しください。'
			$submit-button
				..attr \disabled off
				..text 'Re Reply'

	function add-file(file-data)
		$thumbnail = $ "<li style='background-image: url(#{file-data.url});' data-id='#{file-data.id}' />"
		$remove-button = $ '<button class="remove" title="添付を取り消し"><img src="/resources/desktop/images/form-file-thumbnail-remove.png" alt="remove"></button>'
		$thumbnail.append $remove-button
		$remove-button.click (e) ->
			e.stop-immediate-propagation!
			$thumbnail.remove!
		$reply-form.find '.photos' .append $thumbnail

	function upload-new-file(file)
		name = if file.has-own-property \name then file.name else 'untitled'
		$info = $ "<li><p class='name'>#{name}</p><progress></progress></li>"
		$progress-bar = $info.find \progress
		$reply-form.find '.uploads' .append $info
		window.upload-file do
			file
			(total, uploaded, percentage) ->
				if percentage == 100
					$progress-bar
						..remove-attr \value
						..remove-attr \max
				else
					$progress-bar
						..attr \max total
						..attr \value uploaded
			(html) ->
				$info.remove!
				add-file JSON.parse ($ html).attr \data-data
			->
				$info.remove!

$ ->
	init-post $ '#post > article'
