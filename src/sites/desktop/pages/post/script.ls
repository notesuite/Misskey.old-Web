$ = require 'jquery/dist/jquery'
Sortable = require 'Sortable'
require '../../common/scripts/ui.js'
sncompleter = require '../../common/scripts/sncompleter.js'
tooltiper = require '../../common/scripts/tooltiper.js'
AlbumDialog = require '../../common/scripts/album-dialog.js'
post-content-initializer = require '../../common/scripts/post-content-initializer.js'
sub-post-compiler = require '../../common/views/post/detail/sub-post-render.jade'

class Post
	(post = null) ->
		THIS = @

		if post?
			$post = $ post-compiler {
				post
				config: CONFIG
				me: ME
				user-settings: USER_SETTINGS
				locale: LOCALE
			}

			THIS.init-element $post

	init-element: ($post) ->
		THIS = @

		THIS.$post = $post
		THIS.$repost-form = THIS.$post.children '.repost-form'
		THIS.$reply-form = THIS.$post.children '.reply-form'
		THIS.$destination = THIS.$post.children '.reply-source'
		THIS.$talk = THIS.$post.children '.talk'
		THIS.$replies = THIS.$post.children '.replies'
		THIS.id = THIS.$post.attr \data-id
		if THIS.$destination.length != 0
			THIS.destination-id = THIS.$destination.attr \data-id
		THIS.is-talk = (THIS.$post.attr \data-is-talk) == \true
		THIS.is-have-replies = (THIS.$post.attr \data-is-have-replies) == \true
		THIS.type = THIS.$post.attr \data-type

		# Init like button
		THIS.$post.find '> .main > footer > .actions > .like > button' .click ->
			THIS.like!

		# Init repost button
		THIS.$post.find '> .main > footer > .actions > .repost > button' .click ->
			THIS.repost!

		# Init reply button
		THIS.$post.find '> .main > footer > .actions > .reply > button' .click ->
			THIS.$reply-form.find 'textarea' .focus!

		post-content-initializer THIS.type, THIS.$post.find '> .main > .content'

		THIS.$post.find '> .main > .likes-and-reposts .users > .user > a' .each ->
			tooltiper $ @

		THIS.init-reply-form!

	init-reply-form: ->
		THIS = @

		Sortable.create (THIS.$reply-form.find '.photos')[0], {
			animation: 150ms
		}

		sncompleter THIS.$reply-form.find 'textarea'

		THIS.$reply-form
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
						THIS.add-file file

			..find '.attach-from-local' .click ->
				THIS.$reply-form.find 'input[type=file]' .click!
				return false

			..find 'input[type=file]' .change ->
				files = (THIS.$reply-form.find 'input[type=file]')[0].files
				for i from 0 to files.length - 1
					file = files.item i
					upload-new-file file

			..submit (event) ->
				event.prevent-default!
				THIS.submit-reply!

	check-liked: ->
		THIS = @
		(THIS.$post.attr \data-is-liked) == \true

	check-reposted: ->
		THIS = @
		(THIS.$post.attr \data-is-reposted) == \true

	submit-reply: ->
		THIS = @

		$submit-button = THIS.$reply-form.find \.submit-button
			..attr \disabled on
			..text 'Replying...'

		$.ajax "#{CONFIG.web-api-url}/posts/reply" {
			data:
				'text': (THIS.$reply-form.find \textarea .val!)
				'in-reply-to-post-id': (THIS.id)
				'files': (THIS.$reply-form.find '.photos > li' .map ->
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
			$reply.prepend-to THIS.$post.find '> .replies'
			THIS.$reply-form.remove!
		.fail ->
			window.display-message '返信に失敗しました。再度お試しください。'
			$submit-button
				..attr \disabled off
				..text 'Re Reply'

	add-file: (file-data) ->
		THIS = @

		$thumbnail = $ "<li style='background-image: url(#{file-data.url});' data-id='#{file-data.id}' />"
		$remove-button = $ '<button class="remove" title="添付を取り消し"><img src="' + CONFIG.resources-url + '/desktop/common/images/delete.png" alt="remove"></button>'
		$thumbnail.append $remove-button
		$remove-button.click (e) ->
			e.stop-immediate-propagation!
			$thumbnail.remove!
		THIS.$reply-form.find '.photos' .append $thumbnail

	upload-new-file: (file) ->
		THIS = @

		name = if file.has-own-property \name then file.name else 'untitled'
		$info = $ "<li><p class='name'>#{name}</p><progress></progress></li>"
		$progress-bar = $info.find \progress
		THIS.$reply-form.find '.uploads' .append $info
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
				THIS.add-file JSON.parse ($ html).attr \data-data
			->
				$info.remove!

	like: ->
		THIS = @
		$button = THIS.$post.find '> footer > .actions > .like > button'
			..attr \disabled on
		$button.find \i .transition {
			perspective: '100px'
			rotate-x: '-360deg'
		} 500ms
		if THIS.check-liked!
			THIS.$post.attr \data-is-liked \false
			$.ajax "#{CONFIG.web-api-url}/posts/unlike" {
				data: {'post-id': THIS.id}}
			.done ->
				$button.attr \disabled off
			.fail ->
				$button.attr \disabled off
				THIS.$post.attr \data-is-liked \true
		else
			THIS.$post.attr \data-is-liked \true
			$.ajax "#{CONFIG.web-api-url}/posts/like" {
				data: {'post-id': THIS.id}}
			.done ->
				$button.attr \disabled off
			.fail ->
				$button.attr \disabled off
				THIS.$post.attr \data-is-liked \false

	repost: ->
		THIS = @

		function repost(always, done, fail)
			THIS.$post.attr \data-is-reposted \true
			$.ajax "#{CONFIG.web-api-url}/posts/repost" {
				data: {'post-id': THIS.id}}
			.done ->
				window.display-message 'Reposted!'
				done!
			.fail ->
				THIS.$post.attr \data-is-reposted \false
				window.display-message 'Repostに失敗しました。再度お試しください。'
				fail!
			.always ->
				always!

		function open
			THIS.$repost-form.find '.background' .css \display \block
			THIS.$repost-form.find '.background' .animate {
				opacity: 1
			} 100ms \linear

			THIS.$repost-form.find '.form' .css \display \block
			THIS.$repost-form.find '.form' .animate {
				opacity: 1
			} 100ms \linear

		function close
			THIS.$repost-form.find '.background' .animate {
				opacity: 0
			} 100ms \linear ->
				THIS.$repost-form.find '.background' .css \display \none

			THIS.$repost-form.find '.form' .animate {
				opacity: 0
			} 100ms \linear ->
				THIS.$repost-form.find '.form' .css \display \none

		if USER_SETTINGS.confirmation-when-repost
			open!

			THIS.$repost-form.find '.form' .unbind \submit
			THIS.$repost-form.find '.form' .one \submit (event) ->
				event.prevent-default!
				$form = $ @
				$submit-button = $form.find \.accept
					..attr \disabled on
					..attr \data-reposting \true
				repost do
					->
						$submit-button
							..attr \disabled off
							..attr \data-reposting \false
					->
						close!

			THIS.$repost-form.find '.form > .actions > .cancel' .unbind \click
			THIS.$repost-form.find '.form > .actions > .cancel' .one \click ->
				close!

			THIS.$repost-form.find '.background' .unbind \click
			THIS.$repost-form.find '.background' .one \click ->
				close!
		else
			repost!


$ ->
	post = new Post!
		..init-element $ '#post > article'
