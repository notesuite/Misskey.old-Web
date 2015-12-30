$ = require 'jquery'
require 'jquery.transit'
Sortable = require 'Sortable'
upload-file = require '../../../common/upload-file.js'
sncompleter = require './sncompleter.js'
post-content-initializer = require './post-content-initializer.js'
post-compiler = require '../views/post/smart/render.jade'
sub-post-compiler = require '../views/post/smart/sub-post-render.jade'
AlbumWindow = require './album-window.js'

album = new AlbumWindow

class Post
	(post = null) ->
		THIS = @
		@animation-speed = 200ms
		@is-open = false
		@is-talk-loaded = false
		@is-replies-loaded = false

		if post?
			$post = $ post-compiler {
				post
				config: CONFIG
				me: ME
				user-settings: USER_SETTINGS
			}

			THIS.init-element $post

	init-element: ($post) ->
		THIS = @

		THIS.$post = $post
		THIS.$post.attr \data-is-display-active \false
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

		THIS.$post.keydown (e) ->
			tag = e.target.tag-name.to-lower-case!
			if tag != \input and tag != \textarea and tag != \button
				if e.which == 38 # ↑
					THIS.$post.prev!.focus!
				if e.which == 40 # ↓
					THIS.$post.next!.focus!
				if e.which == 13 # Enter
					e.prevent-default!
					THIS.toggle-display-state!
				if e.which == 82 # r
					e.prevent-default!
					if not THIS.is-open
						THIS.open!
					THIS.focus-reply-form!
				if e.which == 70 or e.which == 76 # f or l
					THIS.like!
				if e.which == 69 # e
					THIS.repost!

		THIS.$post.click (event) ->
			if document.get-selection!.to-string! != ''
			or $ event.target .closest \.repost-form .length > 0
			or $ event.target .is \input
			or $ event.target .is \textarea
			or $ event.target .is \button
			or $ event.target .is \i
			or $ event.target .is \time
			or $ event.target .is \a
			or $ event.target .closest \a .length > 0
				return

			THIS.toggle-display-state!
			THIS.focus-reply-form!

		# Init like button
		THIS.$post.find '> footer > .actions > .like > button' .click ->
			THIS.like!

		# Init repost button
		THIS.$post.find '> footer > .actions > .repost > button' .click ->
			THIS.repost!

		# Init reply button
		THIS.$post.find '> footer > .actions > .reply > button' .click ->
			THIS.toggle-display-state!
			THIS.focus-reply-form!

		post-content-initializer THIS.type, THIS.$post.find '> .main > .content'

		if LOGIN
			THIS.init-reply-form!

	init-reply-form: ->
		THIS = @

		Sortable.create (THIS.$reply-form.find '.photos')[0], {
			animation: 150ms
		}

		sncompleter THIS.$reply-form.find 'textarea'

		THIS.$reply-form.find 'textarea' .keydown (e) ->
			if e.which == 27 # Esc
				e.prevent-default!
				THIS.$post.focus!

		# Paste file
		THIS.$reply-form.find 'textarea' .on \paste (event) ->
			items = (event.clipboard-data || event.original-event.clipboard-data).items
			for i from 0 to items.length - 1
				item = items[i]
				if item.kind == \file && item.type.index-of \image != -1
					file = item.get-as-file!
					THIS.upload-new-file file

		# Ctrl + Enter
		THIS.$reply-form.find 'textarea' .keypress (e) ->
			if (e.char-code == 10 || e.char-code == 13) && e.ctrl-key
				THIS.submit-reply!

		THIS.$reply-form.find '.attach-from-album' .click ->
			window.open-select-album-file-dialog (files) ->
				files.for-each (file) ->
					THIS.attach-file file

		THIS.$reply-form.find '.attach-from-local' .click ->
			THIS.$reply-form.find 'input[type=file]' .click!
			false

		THIS.$reply-form.find 'input[type=file]' .change ->
			files = (THIS.$reply-form.find 'input[type=file]')[0].files
			for i from 0 to files.length - 1
				file = files.item i
				THIS.upload-new-file file

		THIS.$reply-form.submit (event) ->
			event.prevent-default!
			THIS.submit-reply!

	set-parent-timeline: (parent-timeline) ->
		THIS = @
		THIS.timeline = parent-timeline

	sub-render: (post) ->
		$ sub-post-compiler {
			post
			config: CONFIG
			me: ME
			user-settings: USER_SETTINGS
		}

	check-liked: ->
		THIS = @
		(THIS.$post.attr \data-is-liked) == \true

	check-reposted: ->
		THIS = @
		(THIS.$post.attr \data-is-reposted) == \true

	focus-reply-form: ->
		THIS = @
		reply-form-text = THIS.$reply-form.find 'textarea' .val!
		THIS.$reply-form.find  'textarea' .val ''
		THIS.$reply-form.find  'textarea' .focus! .val reply-form-text

	load-talk: ->
		THIS = @
		if THIS.is-talk and not THIS.is-talk-loaded
			THIS.is-talk-loaded = true
			$.ajax "#{CONFIG.web-api-url}/posts/talk/show" {
				data: {'post-id': THIS.destination-id}}
			.done (posts) ->
				THIS.$talk.append posts.map (post) ->
					THIS.sub-render post
			.fail ->
				THIS.is-talk-loaded = false

	load-replies: ->
		THIS = @
		if THIS.is-have-replies and not THIS.is-replies-loaded
			THIS.is-replies-loaded = true
			$.ajax "#{CONFIG.web-api-url}/posts/replies/show" {
				data: {'post-id':THIS.id}}
			.done (posts) ->
				THIS.$replies .append posts.map (post) ->
					THIS.sub-render post
			.fail ->
				THIS.is-replies-loaded = false

	toggle-display-state: ->
		THIS = @
		if THIS.is-open
			THIS.close!
		else
			THIS.open!

	close: ->
		THIS = @
		if THIS.is-open
			THIS.is-open = false
			THIS.$post.attr \data-is-display-active \false
			THIS.$post.find '.talk-ellipsis' .show THIS.animation-speed
			THIS.$post.find '.replies-ellipsis' .show THIS.animation-speed
			THIS.$post.find '.talk' .slide-up THIS.animation-speed
			THIS.$post.find '.reply-form' .hide THIS.animation-speed
			THIS.$post.find '.replies' .slide-up THIS.animation-speed
			THIS.$post.prev!.remove-class \display-active-before
			THIS.$post.next!.remove-class \display-active-after

	open: ->
		THIS = @
		if not THIS.is-open
			THIS.timeline.posts.for-each (post) ->
				post.close!
				post.$post.remove-class \display-active-before
				post.$post.remove-class \display-active-after

			THIS.is-open = true

			THIS.$post.attr \data-is-display-active \true
			THIS.$post.prev!.add-class \display-active-before
			THIS.$post.next!.add-class \display-active-after

			THIS.$post.find  '> .talk-ellipsis' .hide THIS.animation-speed
			THIS.$post.find  '> .replies-ellipsis' .hide THIS.animation-speed
			THIS.$post.find  '> .talk' .slide-down THIS.animation-speed
			THIS.$post.find  '> .reply-form' .show THIS.animation-speed
			THIS.$post.find  '> .replies' .slide-down THIS.animation-speed

			THIS.load-talk!
			THIS.load-replies!

	submit-reply: ->
		THIS = @

		$submit-button = THIS.$reply-form.find \.submit-button
			..attr \disabled on
			..text 'Replying...'

		$.ajax "#{CONFIG.web-api-url}/web/posts/reply" {
			data:
				'text': (THIS.$reply-form.find \textarea .val!)
				'in-reply-to-post-id': THIS.id
				'photos': JSON.stringify((THIS.$reply-form.find '.photos > li' .map ->
					($ @).attr \data-id).get!)
		} .done (post) ->
			$reply = THIS.sub-render post
			$reply.prepend-to THIS.$replies
			$i = $ '<i class="fa fa-ellipsis-v replies-ellipsis" style="display: none;"></i>'
			$i.append-to THIS.$post
			THIS.$reply-form.remove!
			THIS.$post.focus!
			window.display-message '返信しました！'
		.fail ->
			window.display-message '返信に失敗しました。再度お試しください。'
			$submit-button.text 'Re Reply'
		.always ->
			$submit-button.attr \disabled off

	attach-file: (file) ->
		THIS = @
		$thumbnail = $ "<li style='background-image: url(#{file.thumbnail-url});' data-id='#{file.id}' />"
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
		$progress = $info.find \progress
		THIS.$reply-form.find '.uploads' .append $info
		upload-file do
			file
			$progress
			(total, uploaded, percentage) ->
			(file) ->
				$info.remove!
				THIS.attach-file file
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

		if USER_SETTINGS.show-confirmation-when-repost
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

class Timeline
	($tl) ->
		THIS = @

		THIS.$tl = $tl.children \.posts
		THIS.posts = []

		THIS.$tl.children!.each ->
			post = new Post!
				..init-element $ @
				..set-parent-timeline THIS

			THIS.posts.push post

	add: (post-data) ->
		THIS = @

		if USER_SETTINGS.enable-notification-sound-when-receiving-new-post
			new Audio CONFIG.resources-url + '/desktop/common/sounds/post.mp3' .play!

		post = new Post post-data
			..set-parent-timeline THIS

		THIS.posts.unshift post

		$recent-post = THIS.$tl.children ':first-child'
		if ($recent-post.attr \data-is-display-active) == \true
			post.$post.add-class \display-active-before

		post.$post.prepend-to THIS.$tl .hide!.slide-down 200ms

	add-last: (post-data) ->
		THIS = @

		post = new Post post-data
			..set-parent-timeline THIS

		post.$post.append-to THIS.$tl

		THIS.posts.push post

module.exports = Timeline
