$ = require 'jquery'
Sortable = require 'Sortable'
sncompleter = require './sncompleter.js'
post-content-initializer = require './post-content-initializer.js'
post-compiler = require '../views/post/smart/render.jade'
sub-post-compiler = require '../views/post/smart/sub-post-render.jade'
Album = require './album.js'

album = new Album

class Timeline
	($tl) ->
		THIS = @

		THIS.tl = $tl.find '> .posts'
		THIS.posts = THIS.tl.children!

		THIS.posts.each ->
			THIS.init-post $ @

	init-post: ($post) ->
		THIS = @

		function check-liked
			($post.attr \data-is-liked) == \true

		function check-reposted
			($post.attr \data-is-reposted) == \true

		function focus-reply-form
			reply-form-text = $post.find '> .reply-form textarea' .val!
			$post.find  '> .reply-form textarea' .val ''
			$post.find  '> .reply-form textarea' .focus! .val reply-form-text

		function toggle-display-state
			animation-speed = 200ms
			if ($post.attr \data-is-display-active) == \false
				THIS.posts.each ->
					$ @
						..attr \data-is-display-active \false
						..remove-class \display-active-before
						..remove-class \display-active-after
				THIS.posts.find '.talk-ellipsis' .each ->
					$ @ .show animation-speed
				THIS.posts.find '.replies-ellipsis' .each ->
					$ @ .show animation-speed
				THIS.posts.find '.talk' .each ->
					$ @ .slide-up animation-speed
				THIS.posts.find '.reply-form' .each ->
					$ @ .hide animation-speed
				THIS.posts.find '.replies' .each ->
					$ @ .slide-up animation-speed
				$post
					..attr \data-is-display-active \true
					..prev!.add-class \display-active-before
					..next!.add-class \display-active-after
					..find  '> .talk-ellipsis' .hide animation-speed
					..find  '> .replies-ellipsis' .hide animation-speed
					..find  '> .talk' .slide-down animation-speed
					..find  '> .reply-form' .show animation-speed
					..find  '> .replies' .slide-down animation-speed
				if (($post.attr \data-is-talk) == \true) and ($post.children \.talk .children!.length == 0)
					$.ajax "#{config.web-api-url}/posts/talk/show" {
						data:
							'post-id': $post.children \.reply-source .attr \data-id
					} .done (posts) ->
						$talk = posts.map (post) ->
							THIS.sub-render post
						$post.children \.talk .append $talk
				if (($post.attr \data-is-have-replies) == \true) and ($post.children \.replies .children!.length == 0)
					$.ajax "#{config.web-api-url}/posts/replies/show" {
						data:
							'post-id': $post.attr \data-id
					} .done (posts) ->
						$replies = posts.map (post) ->
							THIS.sub-render post
						$post.children \.replies .append $replies

			else
				$post
					..attr \data-is-display-active \false
					..prev!.remove-class \display-active-before
					..next!.remove-class \display-active-after
					..find  '> .talk-ellipsis' .show animation-speed
					..find  '> .replies-ellipsis' .show animation-speed
					..find  '> .talk' .slide-up animation-speed
					..find  '> .reply-form' .hide animation-speed
					..find  '> .replies' .slide-up animation-speed

		function submit-reply
			$form = $post.find '> .reply-form'
			$submit-button = $form.find \.submit-button
				..attr \disabled on
				..text 'Replying...'

			$.ajax "#{config.web-api-url}/web/posts/reply" {
				data:
					'text': ($form.find \textarea .val!)
					'in-reply-to-post-id': ($post.attr \data-id)
					'photos': JSON.stringify(($form.find '.photos > li' .map ->
						($ @).attr \data-id).get!)
			} .done (post) ->
				$reply = THIS.sub-render post
				$submit-button.attr \disabled off
				$reply.prepend-to $post.find '> .replies'
				$i = $ '<i class="fa fa-ellipsis-v replies-ellipsis" style="display: none;"></i>'
				$i.append-to $post
				$form.remove!
				window.display-message '返信しました！'
			.fail ->
				window.display-message '返信に失敗しました。再度お試しください。'
				$submit-button
					..attr \disabled off
					..text 'Re Reply'

		function add-file(file-data)
			$thumbnail = $ "<li style='background-image: url(#{file-data.url});' data-id='#{file-data.id}' />"
			$remove-button = $ '<button class="remove" title="添付を取り消し"><img src="/resources/desktop/common/images/delete.png" alt="remove"></button>'
			$thumbnail.append $remove-button
			$remove-button.click (e) ->
				e.stop-immediate-propagation!
				$thumbnail.remove!
			$post.find '> .reply-form .photos' .append $thumbnail

		function upload-new-file(file)
			name = if file.has-own-property \name then file.name else 'untitled'
			$info = $ "<li><p class='name'>#{name}</p><progress></progress></li>"
			$progress-bar = $info.find \progress
			$post.find '> .reply-form .uploads' .append $info
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

		function like
			$button = $post.find '> footer > .actions > .like > button'
				..attr \disabled on
			if check-liked!
				$post.attr \data-is-liked \false
				$.ajax "#{config.web-api-url}/posts/unlike" {
					data: {'post-id': $post.attr \data-id}}
				.done ->
					$button.attr \disabled off
				.fail ->
					$button.attr \disabled off
					$post.attr \data-is-liked \true
			else
				$post.attr \data-is-liked \true
				$.ajax "#{config.web-api-url}/posts/like" {
					data: {'post-id': $post.attr \data-id}}
				.done ->
					$button.attr \disabled off
				.fail ->
					$button.attr \disabled off
					$post.attr \data-is-liked \false

		function repost(done, fail)
			$post.attr \data-is-reposted \true
			$.ajax "#{config.web-api-url}/posts/repost" {
				data:
					'post-id': $post.attr \data-id}
			.done ->
				done!
			.fail ->
				$post.attr \data-is-reposted \false
				fail!

		$post.attr \data-is-display-active \false

		post-type = $post.attr \data-type

		Sortable.create ($post.find '> .reply-form .photos')[0], {
			animation: 150ms
		}

		sncompleter $post.find '> .reply-form textarea'

		$post.keydown (e) ->
			tag = e.target.tag-name.to-lower-case!
			if tag != \input and tag != \textarea
				if e.which == 38 # ↑
					$post.prev!.focus!
				if e.which == 40 # ↓
					$post.next!.focus!
				if e.which == 13 # Enter
					e.prevent-default!
					toggle-display-state!
				if e.which == 82 # r
					e.prevent-default!
					if ($post.attr \data-is-display-active) == \false
						toggle-display-state!
						focus-reply-form!
					else
						focus-reply-form!
				if e.which == 70 or e.which == 76 # f or l
					like!
				if e.which == 69 # e
					repost!

		$post.find '> .reply-form textarea' .keydown (e) ->
			if e.which == 27
				e.prevent-default!
				$post.focus!

		$post.find '> .reply-form textarea' .on \paste (event) ->
			items = (event.clipboard-data || event.original-event.clipboard-data).items
			for i from 0 to items.length - 1
				item = items[i]
				if item.kind == \file && item.type.index-of \image != -1
					file = item.get-as-file!
					upload-new-file file

		$post.find '> .reply-form textarea' .keypress (e) ->
			if (e.char-code == 10 || e.char-code == 13) && e.ctrl-key
				submit-reply!

		$post.find '> .reply-form .attach-from-album' .click ->
			window.open-select-album-file-dialog (files) ->
				files.for-each (file) ->
					add-file file

		$post.find '> .reply-form .attach-from-local' .click ->
			$post.find '> .reply-form input[type=file]' .click!
			false

		$post.find '> .reply-form input[type=file]' .change ->
			files = ($post.find '> .reply-form input[type=file]')[0].files
			for i from 0 to files.length - 1
				file = files.item i
				upload-new-file file

		$post
			# Click event
			..click (event) ->
				can-event = ! (((<[ input textarea button i time a ]>
					.map (element) -> $ event.target .is element)
					.index-of yes) >= 0)

				if document.get-selection!.to-string! != ''
					can-event = no

				if $ event.target .closest \.repost-form .length > 0
					can-event = no

				if can-event
					toggle-display-state!
					focus-reply-form!

			..find '> .reply-form' .submit (event) ->
				event.prevent-default!
				submit-reply!

			# Init like button
			..find '> footer > .actions > .like > button' .click ->
				like!

			# Init reply button
			..find '> footer > .actions > .reply > button' .click ->
				toggle-display-state!

			# Init repost button
			..find '> footer > .actions > .repost > button' .click ->
				if check-reposted!
					$post.attr \data-is-reposted \false
					$.ajax "#{config.web-api-url}/post/unrepost" {
						data: {'post-id': $status.attr \data-id}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$status.attr \data-is-reposted \true
				else
					$post.find '> .repost-form .background' .css \display \block
					$post.find '> .repost-form .background' .animate {
						opacity: 1
					} 100ms \linear
					$post.find '> .repost-form .form' .css \display \block
					$post.find '> .repost-form .form' .animate {
						opacity: 1
					} 100ms \linear

			# Init repost form
			..find '> .repost-form > .form' .submit (event) ->
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
						window.display-message 'Reposted!'
						$post.find '> .repost-form .background' .animate {
							opacity: 0
						} 100ms \linear -> $post.find '> .repost-form .background' .css \display \none
						$post.find '> .repost-form .form' .animate {
							opacity: 0
						} 100ms \linear -> $post.find '> .repost-form .form' .css \display \none
					->
						$submit-button
							..attr \disabled off
							..attr \data-reposting \false
						window.display-message 'Repostに失敗しました。再度お試しください。'

			..find '> .repost-form > .form > .actions > .cancel' .click ->
				$post.find '> .repost-form .background' .animate {
					opacity: 0
				} 100ms \linear -> $post.find '> .repost-form .background' .css \display \none
				$post.find '> .repost-form .form' .animate {
					opacity: 0
				} 100ms \linear -> $post.find '> .repost-form .form' .css \display \none
			..find '> .repost-form .background' .click ->
				$post.find '> .repost-form .background' .animate {
					opacity: 0
				} 100ms \linear -> $post.find '> .repost-form .background' .css \display \none
				$post.find '> .repost-form .form' .animate {
					opacity: 0
				} 100ms \linear -> $post.find '> .repost-form .form' .css \display \none

		post-content-initializer post-type, $post.find '> .main > .content'

	render: (post) ->
		$ post-compiler {
			config: CONFIG,
			me: ME,
			post
		}

	sub-render: (post) ->
		$ sub-post-compiler {
			config: CONFIG,
			me: ME,
			post
		}

	add: (post) ->
		THIS = @

		$post = THIS.render post

		new Audio '/resources/desktop/common/sounds/post.mp3' .play!

		$recent-post = THIS.tl.children ':first-child'
		if ($recent-post.attr \data-is-display-active) == \true
			$post.add-class \display-active-before
		THIS.init-post $post
		$post.prepend-to THIS.tl .hide!.slide-down 200ms
		THIS.refresh-my-posts!

	add-last: (post) ->
		THIS = @

		$post = THIS.render post

		THIS.init-post $post
		$post.append-to THIS.tl
		THIS.refresh-my-posts!

	refresh-my-posts: ->
		THIS = @
		THIS.posts = THIS.tl.children!

module.exports = Timeline
