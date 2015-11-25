$ = require 'jquery'
Sortable = require 'Sortable'
sncompleter = require './sncompleter.js'
post-content-initializer = require './post-content-initializer.js'
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

		function activate-display-state
			animation-speed = 200ms
			if ($post.attr \data-is-display-active) == \false
				reply-form-text = $post.find '> .reply-form textarea' .val!
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
					..find  '> .reply-form textarea' .val ''
					..find  '> .reply-form textarea' .focus! .val reply-form-text
					..find  '> .replies' .slide-down animation-speed
				if (($post.attr \data-is-talk) == \true) and ($post.children \.talk .children!.length == 0)
					$.ajax "#{config.web-api-url}/web/sites/desktop/home/posts/talk" {
						type: \get
						data:
							'post-id': $post.children \.reply-source .attr \data-id
						data-type: \text
						xhr-fields: {+with-credentials}}
					.done (html) ->
						$talk = $ html
						$post.children \.talk .append $talk
				if (($post.attr \data-is-have-replies) == \true) and ($post.children \.replies .children!.length == 0)
					$.ajax "#{config.web-api-url}/web/sites/desktop/home/posts/replies" {
						type: \get
						data:
							'post-id': $post.attr \data-id
						data-type: \text
						xhr-fields: {+with-credentials}}
					.done (html) ->
						$replies = $ html
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

			$.ajax "#{config.web-api-url}/web/sites/desktop/home/posts/reply" {
				type: \post
				data:
					'text': ($form.find \textarea .val!)
					'in-reply-to-post-id': ($post.attr \data-id)
					'photos': JSON.stringify(($form.find '.photos > li' .map ->
						($ @).attr \data-id).get!)
				data-type: \text
				xhr-fields: {+with-credentials}}
			.done (html) ->
				$reply = $ html
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
			$remove-button = $ '<button class="remove" title="添付を取り消し"><img src="/resources/desktop/images/form-file-thumbnail-remove.png" alt="remove"></button>'
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

		$post.attr \data-is-display-active \false

		post-type = $post.attr \data-type

		Sortable.create ($post.find '> .reply-form .photos')[0], {
			animation: 150ms
		}

		sncompleter $post.find '> .reply-form textarea'

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
					activate-display-state!

			..find '> .reply-form' .submit (event) ->
				event.prevent-default!
				submit-reply!

			# Init like button
			..find '> .footer > .actions > .like > .like-button' .click ->
				$button = $ @
					..attr \disabled on
				if check-liked!
					$post.attr \data-is-liked \false
					$.ajax "#{config.web-api-url}/posts/unlike" {
						type: \delete
						data: {'post-id': $post.attr \data-id}
						xhr-fields: {+with-credentials}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$post.attr \data-is-liked \true
				else
					$post.attr \data-is-liked \true
					$.ajax "#{config.web-api-url}/posts/like" {
						type: \post
						data: {'post-id': $post.attr \data-id}
						xhr-fields: {+with-credentials}}
					.done ->
						$button.attr \disabled off
					.fail ->
						$button.attr \disabled off
						$post.attr \data-is-liked \false

			# Init reply button
			..find '> .footer > .actions > .reply > .reply-button' .click ->
				activate-display-state!

			# Init repost button
			..find '> .footer > .actions > .repost > .repost-button' .click ->
				if check-reposted!
					$post.attr \data-is-reposted \false
					$.ajax "#{config.web-api-url}/post/unrepost" {
						type: \delete
						data: {'post-id': $status.attr \data-id}
						xhr-fields: {+with-credentials}}
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
				$post.attr \data-is-reposted \true
				$.ajax "#{config.web-api-url}/posts/repost" {
					type: \post
					data:
						'post-id': $post.attr \data-id
					xhr-fields: {+with-credentials}}
				.done ->
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
				.fail ->
					$submit-button
						..attr \disabled off
						..attr \data-reposting \false
					$post.attr \data-is-reposted \false
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

	add: ($post) ->
		THIS = @

		new Audio '/resources/sounds/pop.mp3' .play!

		$recent-post = THIS.tl.children ':first-child'
		if ($recent-post.attr \data-is-display-active) == \true
			$post.add-class \display-active-before
		THIS.init-post $post
		$post.prepend-to THIS.tl .hide!.slide-down 200ms
		THIS.refresh-my-posts!

	add-last: ($post) ->
		THIS = @

		THIS.init-post $post
		$post.append-to THIS.tl
		THIS.refresh-my-posts!

	refresh-my-posts: ->
		THIS = @
		THIS.posts = THIS.tl.children!

module.exports = Timeline
